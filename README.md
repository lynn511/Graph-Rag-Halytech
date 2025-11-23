HALY TECH – AI Marketing Project
Overview

This project is an AI-powered marketing assistant that helps businesses access information quickly, improve customer engagement, and streamline product-related queries. It uses a Retrieval-Augmented Generation (RAG) workflow to answer user questions based on uploaded documents.

Features

Document ingestion and vector indexing (PDFs)

Fast and accurate information retrieval using RAG

Frontend interface for user queries

Backend API integrating OpenAI models

Automated workflow components built with n8n

Tech Stack

Backend: FastAPI, Python, LangChain
AI Models: OpenAI embeddings and LLMs
Vector Store: ChromaDB
Orchestration: n8n
Frontend: Vite + Tailwind
Tools: GitHub Copilot

How It Works

Users upload documents through the interface.

Documents are embedded and stored in ChromaDB.

Queries pass through the RAG pipeline.

The system retrieves relevant context and generates accurate responses.

Project Structure
backend/        # API, RAG pipeline, document processing
frontend/       # User interface
workflows/      # n8n automation flows
docs/           # Project documents and slides

Setup Instructions
1. Clone the repository
git clone https://github.com/Hadicheayto/ai-marketing-project.git
cd ai-marketing-project

2. Backend setup

Install backend dependencies and run the API:

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3. Frontend setup
cd frontend
npm install
npm run dev

4. Optional: configure n8n workflows

Refer to the files in workflows/.

Use Cases

Customer support automation

Product information retrieval

Internal knowledge management

Marketing content assistance
