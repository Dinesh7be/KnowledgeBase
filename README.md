# Knowledge Base Chatbot

A production-ready **RAG (Retrieval-Augmented Generation)** chatbot that answers questions exclusively from your uploaded documents. Built with Next.js 14, Fastify, and Qdrant.

![Frontend](https://img.shields.io/badge/Frontend-Next.js_14-black) ![Backend](https://img.shields.io/badge/Backend-Fastify-white) ![Database](https://img.shields.io/badge/Vector_DB-Qdrant-red) ![Type](https://img.shields.io/badge/Type-Private_RAG-blue)

## 🚀 Features

### core Functionality
- 📄 **Document Ingestion**: Upload PDF, DOCX, TXT, and Markdown files.
- 🔍 **Semantic Search**: Powered by OpenAI `text-embedding-3-large` for high accuracy.
- 🤖 **Strict RAG**: Answers only from your documents. No hallucinations.
- 👥 **Per-User Isolation**: Complete data privacy. Users only see their own documents and chats.

### Chat & Interface
- 💬 **Smart Chatbot**: Handles greetings, acknowledgments ("thanks"), and document queries.
- 📝 **Chat Sessions**: Conversations grouped by session for better history management.
- 📜 **Chat Logs**: Full history of all conversations with source citations.
- 🔌 **Embeddable Widget**: Add the chatbot to any website with a simple script tag.

### Security & Management
- 🔐 **Authentication**: Secure email/password login with JWT.
- 📧 **Forgot Password**: OTP-based password reset via email.
- ⚙️ **Configurable**: Adjust chunk size, similarity threshold, and top-k results via UI.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Fastify, TypeScript, Zod Validation |
| **AI/ML** | OpenAI API (Embeddings + GPT-4o-mini), LangChain concepts |
| **Database** | Qdrant (Vector DB), In-Memory (User/Session storage for Demo) |
| **Auth** | JWT, Nodemailer (SMTP) |

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for Qdrant)
- OpenAI API Key

### 1. Start Vector Database
```bash
docker-compose up -d
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
**Update `.env` with:**
- `OPENAI_API_KEY`: Your key
- `SMTP_*`: Your email server details (for auth emails)

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## 📚 API Documentation

### Documents
- `POST /api/documents/upload` - Upload file
- `GET /api/documents` - List user's documents
- `GET /api/documents/stats` - Get user stats

### Chat
- `POST /api/chat` - Send message
- `POST /api/chat/sessions` - Create new session
- `GET /api/chat/sessions` - List user sessions

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request reset OTP

## 🌍 Deployment

### Production Checklist
1. **Database**: Replace in-memory storage (Map) with a real DB (PostgreSQL/MongoDB) in `src/services/auth.service.ts` and `chat.service.ts`.
2. **Environment**: Set `NODE_ENV=production`.
3. **HTTPS**: Ensure SSL is enabled.
4. **CORS**: Update `origin` in `backend/src/index.ts` to allow your production domain.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.