# Private Knowledge Base Chatbot - Development Plan

## Overview

Building a production-ready RAG chatbot with strict context-only answering, self-hosted Qdrant vector database, and a modern Next.js + Fastify stack.

## Project Structure

```
d:\2025\ChatAi\
├── frontend/                   # Next.js App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── knowledge-base/
│   │   │   ├── chatbot/
│   │   │   ├── chat-logs/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── chat/               # Chat-specific components
│   │   ├── documents/          # Document management components
│   │   └── layout/             # Layout components (sidebar, header)
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts
│   ├── hooks/
│   └── types/
│
├── backend/                    # Fastify API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   ├── chat.ts
│   │   │   ├── logs.ts
│   │   │   └── settings.ts
│   │   ├── services/
│   │   │   ├── document.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── qdrant.service.ts
│   │   │   ├── chat.service.ts
│   │   │   └── auth.service.ts
│   │   ├── plugins/
│   │   │   ├── auth.ts
│   │   │   └── rate-limit.ts
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── config/
│   │   └── index.ts
│   ├── prisma/                 # Database schema (for users, logs)
│   └── package.json
│
├── docker-compose.yml          # Qdrant + optional services
├── instructions.md
├── rules.json
└── development-plan.md
```

---

## Phase 1: Project Setup

### 1.1 Initialize Frontend
- Create Next.js 14+ app with App Router
- Configure TypeScript and Tailwind CSS
- Set up folder structure
- Install dependencies: `@tanstack/react-query`, `lucide-react`, `zod`

### 1.2 Initialize Backend  
- Create Fastify project with TypeScript
- Set up folder structure
- Install dependencies: `@fastify/cors`, `@fastify/jwt`, `@fastify/rate-limit`, `zod`, `pino`
- Configure Prisma for user/log storage

### 1.3 Docker Setup
- Create `docker-compose.yml` for Qdrant
- Configure persistent storage for vectors

---

## Phase 2: Backend Core

### 2.1 Authentication System

#### [NEW] [auth.service.ts](file:///d:/2025/ChatAi/backend/src/services/auth.service.ts)
- User registration with password hashing (bcrypt)
- Login with JWT token generation
- Token refresh mechanism

#### [NEW] [auth.ts](file:///d:/2025/ChatAi/backend/src/routes/auth.ts)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

---

### 2.2 Document Ingestion Pipeline

#### [NEW] [document.service.ts](file:///d:/2025/ChatAi/backend/src/services/document.service.ts)
- Parse PDF using `pdf-parse`
- Parse DOCX using `mammoth`
- Parse TXT/MD directly
- Chunk text with configurable size (500-800 tokens)
- Add overlap for context continuity

#### [NEW] [embedding.service.ts](file:///d:/2025/ChatAi/backend/src/services/embedding.service.ts)
- Generate embeddings using OpenAI `text-embedding-3-large`
- Batch embedding for efficiency
- Error handling and retry logic

#### [NEW] [qdrant.service.ts](file:///d:/2025/ChatAi/backend/src/services/qdrant.service.ts)
- Initialize Qdrant collection
- Upsert vectors with metadata
- Search by similarity
- Delete vectors by document ID

#### [NEW] [documents.ts](file:///d:/2025/ChatAi/backend/src/routes/documents.ts)
- `POST /api/documents/upload` - Upload and ingest document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document and vectors
- `POST /api/documents/reindex` - Reindex all documents

---

### 2.3 Chat Service

#### [NEW] [chat.service.ts](file:///d:/2025/ChatAi/backend/src/services/chat.service.ts)
```typescript
// Pseudocode for chat flow
async function handleChat(question: string, userId: string) {
  // 1. Embed the question
  const embedding = await embedQuestion(question);
  
  // 2. Search Qdrant
  const results = await qdrant.search(embedding, { topK: 5 });
  
  // 3. Validate similarity
  const validResults = results.filter(r => r.score >= threshold);
  
  if (validResults.length === 0) {
    return { answer: FALLBACK_MESSAGE, sources: [] };
  }
  
  // 4. Generate answer from context only
  const context = validResults.map(r => r.text).join('\n\n');
  const answer = await generateAnswer(question, context);
  
  // 5. Log the interaction
  await logChat({ question, answer, sources, userId });
  
  return { answer, sources };
}
```

#### [NEW] [chat.ts](file:///d:/2025/ChatAi/backend/src/routes/chat.ts)
- `POST /api/chat` - Send message and get response
- Includes sources in response

---

### 2.4 Chat Logs

#### [NEW] [logs.ts](file:///d:/2025/ChatAi/backend/src/routes/logs.ts)
- `GET /api/logs` - Get paginated chat logs
- `GET /api/logs/:id` - Get specific log entry
- `DELETE /api/logs/:id` - Delete log entry

---

### 2.5 Settings

#### [NEW] [settings.ts](file:///d:/2025/ChatAi/backend/src/routes/settings.ts)
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/reindex` - Trigger reindex
- `POST /api/settings/clear-vectors` - Clear vector DB

---

## Phase 3: Frontend Implementation

### 3.1 Layout & Navigation

#### [NEW] [Sidebar.tsx](file:///d:/2025/ChatAi/frontend/components/layout/Sidebar.tsx)
- Navigation with 5 items (Dashboard, Knowledge Base, Chatbot, Chat Logs, Settings)
- Active state highlighting
- Collapsible on mobile

#### [NEW] [Header.tsx](file:///d:/2025/ChatAi/frontend/components/layout/Header.tsx)
- User profile dropdown
- Logout functionality

---

### 3.2 Dashboard Page

#### [NEW] [page.tsx](file:///d:/2025/ChatAi/frontend/app/(dashboard)/dashboard/page.tsx)
- Total documents count
- Total chunks count
- Recent queries
- System health status

---

### 3.3 Knowledge Base Page

#### [NEW] [page.tsx](file:///d:/2025/ChatAi/frontend/app/(dashboard)/knowledge-base/page.tsx)
- Document upload with drag-and-drop
- Document list with categories
- Delete and view document details
- Processing status indicator

---

### 3.4 Chatbot Page

#### [NEW] [page.tsx](file:///d:/2025/ChatAi/frontend/app/(dashboard)/chatbot/page.tsx)
- Chat interface with message history
- Real-time streaming responses
- Source citations display
- Loading states

---

### 3.5 Chat Logs Page

#### [NEW] [page.tsx](file:///d:/2025/ChatAi/frontend/app/(dashboard)/chat-logs/page.tsx)
- Paginated log table
- Filter by date range
- Search by question
- View sources for each log

---

### 3.6 Settings Page

#### [NEW] [page.tsx](file:///d:/2025/ChatAi/frontend/app/(dashboard)/settings/page.tsx)
- OpenAI API key management (masked input)
- Chunk size slider (500-800)
- Similarity threshold slider
- Reindex button with confirmation
- Clear vector DB with confirmation

---

## Phase 4: Security Implementation

### 4.1 Authentication Middleware
- JWT verification on protected routes
- Token refresh handling

### 4.2 Rate Limiting
- Chat endpoint: 100 requests/minute
- Upload endpoint: 10 requests/minute

### 4.3 File Validation
- Type checking (PDF, DOCX, TXT, MD)
- Size limit (50MB)
- Content validation

---

## Verification Plan

### Automated Tests

#### Backend API Tests
```bash
cd backend
npm run test
```
- Test auth endpoints (register, login)
- Test document upload and ingestion
- Test chat flow with mocked Qdrant
- Test rate limiting

#### Frontend Component Tests
```bash
cd frontend
npm run test
```
- Test UI components render correctly
- Test form validation
- Test API integration with mocked responses

---

### Manual Verification

#### 1. Document Ingestion Flow
1. Start the application with `docker-compose up` and `npm run dev` in both folders
2. Navigate to `/knowledge-base`
3. Upload a test PDF document
4. Verify document appears in the list
5. Check Qdrant for vector entries

#### 2. Chat Flow
1. Navigate to `/chatbot`
2. Ask a question related to uploaded document
3. Verify answer comes from document context
4. Verify sources are displayed
5. Ask an unrelated question
6. Verify fallback message is returned

#### 3. Chat Logs
1. Navigate to `/chat-logs`
2. Verify previous conversations are listed
3. Verify sources and timestamps are correct

#### 4. Settings
1. Navigate to `/settings`
2. Update similarity threshold
3. Trigger reindex
4. Verify settings persist after page reload

---

## User Review Required

> [!IMPORTANT]
> **Technology Choice**: Using Fastify over Express for better performance. Please confirm this is acceptable.

> [!IMPORTANT]
> **Database**: Using Prisma with SQLite for development, PostgreSQL for production (user/log storage). Please confirm.

> [!WARNING]
> **OpenAI Model**: Using `gpt-4o-mini` for chat completions (cost-effective). If you prefer `gpt-4o` or `gpt-4-turbo`, please specify.

> [!IMPORTANT]
> **Authentication Scope**: JWT auth is included. Do you need user roles (admin/user) or is single-user mode sufficient?
