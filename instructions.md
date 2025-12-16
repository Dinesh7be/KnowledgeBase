# Private Knowledge Base Chatbot - Instructions

## Project Overview

A production-grade **Private Knowledge Base Chatbot** that enables organizations to upload internal documents and query them using AI-powered semantic search. The system uses a **strict RAG (Retrieval-Augmented Generation)** approach, ensuring all answers come exclusively from the uploaded knowledge base.

## Core Features

### 1. Document Management
- Upload and manage documents (PDF, DOCX, TXT, Markdown)
- Automatic chunking with configurable size (500-800 tokens)
- Document versioning and categorization
- Metadata extraction and storage

### 2. RAG-Powered Chatbot
- **Strict context-only answers** - No external knowledge
- Semantic search using OpenAI embeddings (`text-embedding-3-large`)
- Similarity threshold validation before answering
- Fallback message when context is insufficient

### 3. Navigation Structure
| Page | Description |
|------|-------------|
| Dashboard | Overview stats, recent activity |
| Knowledge Base | Document upload, management, categories |
| Chatbot | Main chat interface for querying |
| Chat Logs | Query history with sources and timestamps |
| Settings | API keys, reindex, thresholds, chunk size |

### 4. Security
- JWT authentication
- Rate limiting on API endpoints
- File validation (type, size, content)
- OpenAI key stored server-side only

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express/Fastify + TypeScript |
| AI/Embeddings | OpenAI API |
| RAG Framework | LlamaIndex |
| Vector Database | Qdrant (self-hosted) |
| Authentication | JWT |

## Chat Flow

```
User Question → Embed Question → Search Qdrant → Validate Similarity → Generate Answer
                    ↓                  ↓                ↓                   ↓
              text-embedding      top-k=5         threshold check    context-only LLM
               -3-large           vectors           pass/fail          response
```

## Deployment Target

- **Development**: Local environment
- **Production**: VPS deployment

## Key Constraints

1. **No hallucination**: Answers MUST come from retrieved context only
2. **Temperature**: 0.1 (for factual, consistent responses)
3. **Fallback**: "This information is not available in the current knowledge base"
4. **Frontend**: Zero access to OpenAI API keys
