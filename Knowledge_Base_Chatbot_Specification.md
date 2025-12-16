# Private Knowledge Base Chatbot – Build Specification

## 1. Project Goal
Build a private knowledge base web application with an AI chatbot that answers strictly and only from company-uploaded documents.
If an answer is not found in the knowledge base, the chatbot must respond:
"This information is not available in the current knowledge base."

## 2. Tech Stack
Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend:
- Node.js
- Express or Fastify
- TypeScript

AI / RAG:
- OpenAI API
- LlamaIndex
- Qdrant (self-hosted)

Infrastructure:
- Local development first
- Hostinger VPS for production
- Docker, Docker Compose
- Nginx
- PM2

## 3. Architecture
Browser → Next.js → Node.js API → LlamaIndex → Qdrant → OpenAI API

Rule: The LLM must never answer without retrieved context from Qdrant.

## 4. Navigation & Features

### Dashboard
- Total documents
- Total vectors
- Total chats
- Last ingestion status
- Qdrant health

### Knowledge Base
Supported files: PDF, DOCX, TXT, Markdown

Metadata:
- Document name
- Category
- Department
- Version
- Uploaded by
- Uploaded date

Ingestion Pipeline:
1. Upload file
2. Extract text
3. Chunk text (500–800 tokens)
4. Generate embeddings
5. Store in Qdrant with metadata
6. Save status

Chunk format:
{
  "doc_id": "uuid",
  "source": "document_name",
  "chunk_id": 1,
  "text": "chunk content",
  "metadata": {
    "category": "HR",
    "version": "v1.0"
  }
}

### Chatbot (Strict RAG)
1. Embed user question
2. Search Qdrant (Top-K 3–5)
3. If no match → fallback message
4. If match → context + question → OpenAI

Prompt rule:
Answer only from provided context. No external knowledge.

### Chat Logs
- Question
- Sources
- Answer
- Timestamp
- User ID

### Settings
- OpenAI API key
- Chunk size
- Similarity threshold
- Max tokens
- Temperature (0.1–0.2)
- Reindex / clear DB

## 5. Security
- No frontend OpenAI calls
- File validation
- Rate limiting
- JWT auth
- ENV-based secrets

## 6. Local Development
- Docker Compose (Node + Qdrant)
- Local file storage
- Next.js local dev

## 7. VPS Deployment
- Ubuntu VPS (Hostinger)
- Docker + volumes
- PM2 for backend
- Nginx reverse proxy
- SSL enabled

Migration:
- Copy uploads
- Copy Qdrant data
- Update env variables
- Update DNS

## 8. Non-Functional Requirements
- Zero hallucination
- High accuracy
- Scalable
- Production-ready
