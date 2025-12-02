import os
import pickle
import json
from typing import Dict, List

from dotenv import load_dotenv
import fitz  # PyMuPDF
import networkx as nx
import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()


class RAGSystem:
    def __init__(self, data_path: str = "data/docs/"):
        self.data_path = data_path
        self.graph_path = "data/graph.pkl"

        # Initialize components
        self.setup_text_splitter()
        self.setup_chroma()
        self.setup_openai()

        # Load existing graph or create new one
        self.load_or_create_graph()

        # Load PDFs + build vector DB + build graph
        self.initialize_knowledge_base()

    # -------------------------------------------------------------
    # SETUP COMPONENTS
    # -------------------------------------------------------------

    def setup_text_splitter(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
       )

    def setup_chroma(self):
        self.chroma_client = chromadb.Client()
        self.embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self.collection = self.chroma_client.get_or_create_collection(
            name="company_docs",
            embedding_function=self.embedding_func
        )

    def setup_openai(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Set OPENAI_API_KEY in your .env file")
        self.client = OpenAI(api_key=api_key)

    def load_or_create_graph(self):
        """Load existing graph or create new one."""
        if os.path.exists(self.graph_path):
            try:
                with open(self.graph_path, "rb") as f:
                    self.graph = pickle.load(f)
                print(f"Loaded existing graph with {len(self.graph.nodes)} nodes")
            except Exception as e:
                print(f"Error loading graph: {e}. Creating new graph.")
                self.graph = nx.DiGraph()
        else:
            self.graph = nx.DiGraph()

    # -------------------------------------------------------------
    # KNOWLEDGE BASE INGESTION (PDF → chunks → Chroma + Graph)
    # -------------------------------------------------------------

    def initialize_knowledge_base(self):
        if not os.path.exists(self.data_path):
            raise RuntimeError(f"Data directory not found: {self.data_path}")

        files = os.listdir(self.data_path)
        pdf_files = [f for f in files if f.endswith(".pdf")]
        print("PDF files found:", pdf_files)

        if not pdf_files:
            print("No PDF files found.")
            return

        # Check if we need to rebuild (simple check: if collection is empty)
        existing = self.collection.get()["ids"]
        if existing and len(existing) > 0:
            print(f"Knowledge base already initialized with {len(existing)} chunks.")
            return

        # Reset Chroma collection if not empty
        if existing:
            self.collection.delete(existing)

        total_chunks = 0

        for filename in pdf_files:
            path = os.path.join(self.data_path, filename)
            doc = fitz.open(path)

            full_text = "".join([page.get_text() for page in doc])
            chunks = self.splitter.split_text(full_text)

            for i, chunk in enumerate(chunks):
                # Add to Chroma
                self.collection.add(
                    documents=[chunk],
                    metadatas=[{"file": filename, "chunk_id": i}],
                    ids=[f"{filename}_{i}"]
                )
                total_chunks += 1

                # Add to Graph
                graph_data = self.extract_relations(chunk)
                for node in graph_data["nodes"]:
                    node_id = node.get("id", "").strip()
                    if node_id:
                        self.graph.add_node(node_id, **{k: v for k, v in node.items() if k != "id"})
                
                for edge in graph_data["edges"]:
                    source = edge.get("source", "").strip()
                    target = edge.get("target", "").strip()
                    if source and target:
                        self.graph.add_edge(source, target, **{k: v for k, v in edge.items() if k not in ["source", "target"]})

        # Save knowledge graph
        os.makedirs("data", exist_ok=True)
        with open(self.graph_path, "wb") as f:
            pickle.dump(self.graph, f)

        print(f"Knowledge base initialized with {total_chunks} chunks and {len(self.graph.nodes)} graph nodes.")

    # -------------------------------------------------------------
    # GRAPH EXTRACTION (LLM-based)
    # -------------------------------------------------------------

    def extract_relations(self, text: str) -> Dict:
        """Extract entities and relationships from text using LLM."""
        prompt = f"""Extract key entities and relationships from the following text.
Return a JSON object with this exact structure:
{{
  "nodes": [
    {{"id": "entity_name", "type": "entity_type"}}
  ],
  "edges": [
    {{"source": "entity1", "target": "entity2", "relation": "relationship_type"}}
  ]
}}

Only extract meaningful business entities (companies, products, people, departments, projects).

Text:
{text[:800]}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a knowledge graph extraction assistant. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=500,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content.strip()
            result = json.loads(content)
            
            # Validate structure
            if "nodes" not in result:
                result["nodes"] = []
            if "edges" not in result:
                result["edges"] = []
                
            return result
            
        except Exception as e:
            print(f"Error extracting relations: {e}")
            return {"nodes": [], "edges": []}

    # -------------------------------------------------------------
    # GRAPH SEARCH
    # -------------------------------------------------------------

    def graph_search(self, question: str) -> List[str]:
        """Extract entities from user question → find related graph nodes."""
        if len(self.graph.nodes) == 0:
            return []

        prompt = f"""Extract key entities mentioned in this question that might be relevant for a knowledge graph search.
Return a JSON object with format: {{"entities": ["entity1", "entity2", ...]}}

Question: {question}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an entity extraction assistant. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=200,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content.strip()
            result = json.loads(content)
            entities = result.get("entities", [])
            
        except Exception as e:
            print(f"Error extracting entities: {e}")
            entities = []

        # Find matching nodes (case-insensitive partial matching)
        hits = []
        for entity in entities:
            entity_lower = entity.lower()
            for node in self.graph.nodes():
                if entity_lower in node.lower() or node.lower() in entity_lower:
                    # Get node and its neighbors
                    hits.append(node)
                    neighbors = list(self.graph.neighbors(node))
                    hits.extend(neighbors[:3])  # Add up to 3 neighbors per match

        return list(set(hits))[:10]  # Return unique hits, max 10

    # -------------------------------------------------------------
    # MAIN QUERY METHOD (RAG + Graph-RAG)
    # -------------------------------------------------------------

    def query(self, question: str, top_k: int = 3) -> Dict[str, any]:
        """Query the RAG system with both vector and graph retrieval."""
        
        if not question.strip():
            return {
                "answer": "Please enter a valid question.",
                "sources": [],
                "confidence": 0.0,
            }

        try:
            # Vector retrieval
            results = self.collection.query(
                query_texts=[question],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )

            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            # Graph retrieval
            graph_hits = self.graph_search(question)
            graph_context = ""
            if graph_hits:
                graph_context = "Related entities from knowledge graph:\n" + "\n".join([
                    f"- {entity}" for entity in graph_hits[:5]
                ])

            if not docs and not graph_hits:
                return {
                    "answer": "I could not find relevant information in the knowledge base.",
                    "sources": [],
                    "confidence": 0.0,
                }

            # Build context
            context_parts = []
            if docs:
                context_parts.append("Relevant documents:\n" + "\n\n---\n\n".join(docs))
            if graph_context:
                context_parts.append(graph_context)

            context = "\n\n".join(context_parts)

            # LLM generation
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Answer questions based on the provided context from documents and knowledge graph. Be concise and accurate."
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
                }
            ]

            completion = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=512,
                temperature=0.3,
            )

            answer = completion.choices[0].message.content.strip()

            # Confidence score based on vector distances
            if distances:
                avg_distance = sum(distances) / len(distances)
                confidence = max(0.0, min(1.0, 1.0 - avg_distance))
            else:
                confidence = 0.5  # graph-only answer

            # Unique sources
            sources = sorted(set([m.get("file", "unknown") for m in metas]))

            return {
                "answer": answer,
                "sources": sources,
                "confidence": round(confidence, 2),
                "graph_entities": graph_hits[:5] if graph_hits else []
            }

        except Exception as e:
            print(f"Query error: {e}")
            return {
                "answer": f"Error occurred: {str(e)}",
                "sources": [],
                "confidence": 0.0,
            }


# Example usage
if __name__ == "__main__":
    # Initialize the RAG system
    rag = RAGSystem(data_path="data/docs/")
    
    # Query example
    response = rag.query("What are the main products mentioned?")
    
    print("\n=== Answer ===")
    print(response["answer"])
    print(f"\n=== Sources ===")
    print(response["sources"])
    print(f"\n=== Confidence ===")
    print(response["confidence"])
    print(f"\n=== Graph Entities ===")
    print(response.get("graph_entities", []))