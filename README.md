# Private Knowledge Base Chatbot

A production-ready RAG (Retrieval-Augmented Generation) chatbot that answers questions exclusively from your uploaded documents. Built with Next.js, Fastify, LlamaIndex, and Qdrant.

## Features

- 📄 **Document Ingestion** - Upload PDF, DOCX, TXT, and Markdown files
- 🔍 **Semantic Search** - Find relevant content using OpenAI embeddings
- 💬 **Context-Only Answers** - Strict RAG ensures no hallucinations
- 📊 **Dashboard** - View stats and recent activity
- 📝 **Chat Logs** - Track all conversations with sources
- ⚙️ **Settings** - Configure chunk size, similarity threshold, and more

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Fastify + TypeScript |
| AI/Embeddings | OpenAI (text-embedding-3-large, gpt-4o-mini) |
| Vector Database | Qdrant (self-hosted) |
| Authentication | JWT |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for Qdrant)
- OpenAI API Key

### 1. Start Qdrant

```bash
docker-compose up -d
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm install
npm run dev
```

### 3. Configure Frontend

```bash
cd frontend
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Qdrant Dashboard: http://localhost:6333/dashboard

## Project Structure

```
ChatAi/
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & API client
│   └── package.json
│
├── backend/                # Fastify API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── config/        # Configuration
│   └── package.json
│
├── docker-compose.yml      # Qdrant setup
├── instructions.md         # Project overview
├── rules.json             # Development rules
└── development-plan.md    # Implementation plan
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents/upload` - Upload & ingest document
- `GET /api/documents` - List all documents
- `DELETE /api/documents/:id` - Delete document

### Chat
- `POST /api/chat` - Send question, get answer with sources

### Logs
- `GET /api/logs` - Get paginated chat history
- `DELETE /api/logs/:id` - Delete log entry

### Settings
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/clear-vectors` - Clear vector database

## Configuration

### Environment Variables (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `QDRANT_URL` | Qdrant server URL | `http://localhost:6333` |
| `JWT_SECRET` | Secret for JWT tokens | Required |
| `CHUNK_SIZE` | Tokens per chunk | `600` |
| `SIMILARITY_THRESHOLD` | Min similarity score | `0.7` |
| `TOP_K` | Results to retrieve | `5` |

## Usage

1. **Register/Login** - Create an account or login
2. **Upload Documents** - Go to Knowledge Base and upload files
3. **Ask Questions** - Use the Chatbot to query your documents
4. **Review Logs** - Check Chat Logs for history with sources
5. **Adjust Settings** - Fine-tune RAG parameters as needed

## License

MIT
