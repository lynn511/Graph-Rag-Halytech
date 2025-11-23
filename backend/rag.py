import os
from dotenv import load_dotenv
import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI
from typing import List, Dict

# Load environment variables from .env file
load_dotenv()

class RAGSystem:
    def __init__(self, data_path: str = "data/docs/"):
        self.data_path = data_path
        self.setup_text_splitter()
        self.setup_chroma()
        self.setup_openai()
        self.initialize_knowledge_base()
        
    def setup_text_splitter(self):
        """Initialize the text splitter for chunking documents"""
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=750,
            chunk_overlap=200,
            length_function=len
        )
        
    def setup_chroma(self):
        """Initialize ChromaDB with embedding function"""
        self.chroma_client = chromadb.Client()
        self.embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self.collection = self.chroma_client.get_or_create_collection(
            name="company_docs",
            embedding_function=self.embedding_func
        )
        
    def setup_openai(self):
        """Initialize OpenAI client"""
        _api_key = os.getenv("OPENAI_API_KEY")
        if not _api_key:
            raise RuntimeError("Set OPENAI_API_KEY environment variable in .env file")
        self.client = OpenAI(api_key=_api_key)
        
    def initialize_knowledge_base(self):
        """Load all PDFs from the data directory into the knowledge base"""
        
        if not os.path.exists(self.data_path):
            raise RuntimeError(f"Data directory not found: {self.data_path}")
        
        # Debug: list all PDFs in the folder
        files = os.listdir(self.data_path)
        pdf_files = [f for f in files if f.endswith('.pdf')]
        print("PDF files found:", pdf_files)
        
        if not pdf_files:
            print("No PDF files found. Knowledge base will remain empty.")
            return
        
        # Clear existing collection if it's not empty
        existing_ids = self.collection.get()["ids"]
        if existing_ids:
            self.collection.delete(existing_ids)
        
        total_chunks = 0
        
        # Load each PDF in the data directory
        for filename in pdf_files:
            file_path = os.path.join(self.data_path, filename)
            doc = fitz.open(file_path)
            pdf_text = ""
            for page in doc:
                pdf_text += page.get_text()
            
            # Split into chunks
            chunks = self.splitter.split_text(pdf_text)
            
            # Add chunks to ChromaDB
            for i, chunk in enumerate(chunks):
                self.collection.add(
                    documents=[chunk],
                    metadatas=[{"file": filename, "chunk_id": i}],
                    ids=[f'{filename}_{i}']
                )
                total_chunks += 1
        
        # Persist the collection to disk so it's not lost on restart
        if hasattr(self.chroma_client, "persist"):
            self.chroma_client.persist()
        
        print(f"Knowledge base initialized with {total_chunks} chunks from {len(pdf_files)} PDFs")
            
    def query(self, question: str, top_k: int = 3) -> Dict[str, any]:
        """
        Query the RAG system with a question.
        Returns a dict with answer, sources, and confidence.
        """
        if not isinstance(question, str) or not question.strip():
            return {
                "answer": "Please enter a valid question.",
                "sources": [],
                "confidence": 0.0
            }
            
        try:
            # Get relevant chunks from ChromaDB
            results = self.collection.query(
                query_texts=[question],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
            
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            
            if not docs:
                return {
                    "answer": "I apologize, but I don't have enough information to answer that question. Is there something else I can help you with?",
                    "sources": [],
                    "confidence": 0.0
                }
                
            # Prepare context from chunks
            context = "\n\n---\n\n".join(docs)
            
            # Generate answer using OpenAI
            messages = [
                {"role": "system", "content": """You are a knowledgeable and friendly customer support agent. 
                Use the provided context to answer questions accurately and professionally. 
                If you're not sure about something, acknowledge it and offer to help with related information you do have.
                Always maintain a helpful and courteous tone."""},
                {"role": "user", "content": (
                    "Using the context below, help the customer with their question. "
                    "If you can't find a specific answer in the context, be honest and offer to help with related information.\n\n"
                    f"Context:\n{context}\n\nCustomer Question:\n{question}"
                )}
            ]
            
            completion = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=512,
                temperature=0.3,
            )
            
            answer = completion.choices[0].message.content.strip()
            
            # Calculate confidence based on retrieval distances
            avg_distance = sum(distances) / len(distances)
            confidence = max(0.0, min(1.0, 1.0 - avg_distance))
            
            # Get unique sources
            sources = [meta.get("file", "unknown") for meta in metas]
            unique_sources = sorted(set(sources))
            
            return {
                "answer": answer,
                "sources": unique_sources,
                "confidence": confidence
            }
            
        except Exception as e:
            return {
                "answer": "I apologize, but I'm having trouble processing your question. Please try again or rephrase your question.",
                "sources": [],
                "confidence": 0.0
            }
                
        
