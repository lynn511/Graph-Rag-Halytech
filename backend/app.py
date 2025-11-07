from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import os
from pydantic import BaseModel, EmailStr
from rag import RAGSystem
from tickets import TicketManager

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize systems
rag_system = RAGSystem(data_path="data/docs/")
ticket_manager = TicketManager()

class TicketRequest(BaseModel):
    fullName: str
    email: EmailStr
    company: Optional[str] = None
    title: str
    description: str
    urgency: str

class TicketResponse(BaseModel):
    ticketId: str
    status: str
    message: str

class ChatRequest(BaseModel):
    userId: str
    text: str
    context: Dict = {}

class ChatResponse(BaseModel):
    reply: str
    citations: List[str]
    confidence: float
    suggested_replies: Optional[List[str]] = None

@app.post("/api/chat/knowledge")
async def chat_knowledge(request: ChatRequest) -> ChatResponse:
    """
    Handle knowledge-based chat requests using RAG system
    """
    # Query the RAG system
    result = rag_system.query(request.text)
    
    # Generate suggested replies based on the context
    suggested_replies = []
    if result["confidence"] > 0.7:  # Only suggest replies for confident answers
        try:
            messages = [
                {"role": "system", "content": "Based on the previous answer, suggest 2-3 natural follow-up questions. Return only the questions, one per line."},
                {"role": "user", "content": f"Previous answer: {result['answer']}"}
            ]
            completion = rag_system.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=100,
                temperature=0.7,
            )
            suggested_replies = [q.strip() for q in completion.choices[0].message.content.split("\n") if q.strip()][:3]
        except Exception:
            # If suggestion generation fails, continue without suggestions
            pass
    
    return ChatResponse(
        reply=result["answer"],
        citations=result["sources"],
        confidence=result["confidence"],
        suggested_replies=suggested_replies
    )

# @app.post("/api/knowledge/upload")
# async def upload_document(file: UploadFile = File(...)):
#     """
#     Upload and process a new document for the knowledge base
#     """
#     if not file.filename.endswith('.pdf'):
#         raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
#     try:
#         # Create docs directory if it doesn't exist
#         os.makedirs("data/docs", exist_ok=True)
        
#         # Save the uploaded file
#         file_path = os.path.join("data/docs", file.filename)
#         with open(file_path, "wb") as buffer:
#             content = await file.read()
#             buffer.write(content)
        
#         # Add document to RAG system
#         result = rag_system.add_document(file_path)
        
#         return {"message": f"Document processed successfully: {result}"}
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

# Ticket endpoints
@app.post("/api/tickets")
async def create_ticket(request: TicketRequest) -> TicketResponse:
    """
    Create a new support ticket
    """
    try:
        # Create the ticket
        ticket_data = request.model_dump()
        ticket_id = ticket_manager.create_ticket(ticket_data)
        
        return TicketResponse(
            ticketId=ticket_id,
            status="created",
            message="Ticket created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ticket: {str(e)}")

@app.get("/api/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """
    Get ticket details by ID
    """
    ticket = ticket_manager.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
