AI Marketing Project – HALY TECH
Overview

This project is an AI-powered marketing assistant designed to help businesses access information quickly, improve customer engagement, and streamline product-related queries.
It uses a Retrieval-Augmented Generation (RAG) workflow to answer questions based on uploaded documents.

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

Tools: Copilot for code generation support

How It Works

Upload documents through the interface.

Documents are embedded and stored in ChromaDB.

User queries are processed through the RAG pipeline.

The system retrieves relevant context and generates accurate responses.

Project Structure

backend/ – API, RAG pipeline, document processing

frontend/ – User interface

workflows/ – n8n automation flows

docs/ – Project documentation and slides

Setup Instructions

Clone the repository.

Install dependencies (backend and frontend).

Run the backend server (FastAPI).

Run the frontend application.

Optional: configure n8n workflows.

Use Cases

Customer support automation

Product information retrieval

Internal knowledge management

Marketing content assistance
