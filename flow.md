# Knowledge Base Chatbot - Implementation Flow

Complete step-by-step documentation of the project.

---

## 🏗️ Project Overview

**Application**: Private Knowledge Base Chatbot with RAG (Retrieval-Augmented Generation)  
**Domain**: https://knowledgebase.eduwhistle.com/  
**Repository**: https://github.com/Dinesh7be/KnowledgeBase

---

## 📁 Project Structure

```
KnowledgeBase/
├── backend/                 # Fastify API Server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── config/         # Configuration
│   ├── .env                # Environment variables (NOT in git)
│   └── package.json
│
├── frontend/               # Next.js 14 App
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & API client
│   ├── public/            # Static assets (favicon, widget.js)
│   ├── .env.local         # Environment variables (NOT in git)
│   └── package.json
│
├── docker-compose.yml      # Qdrant vector database
├── flow.md                 # This file
└── README.md              # Project documentation
```

---

## 🔧 Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Fastify, TypeScript, tsx |
| AI/ML | OpenAI API (Embeddings + GPT-4o-mini) |
| Vector DB | Qdrant (Docker) |
| Auth | JWT, Nodemailer (Brevo SMTP) |

---

## ✅ Features Implemented

### 1. Authentication
- [x] Email/Password Registration with OTP Verification
- [x] Login with JWT Token
- [x] Forgot Password with OTP Reset
- [x] Google OAuth Integration
- [x] Per-User Data Isolation

### 2. Document Management
- [x] PDF, DOCX, TXT, MD Upload
- [x] Text Extraction & Chunking
- [x] Vector Embedding Generation (text-embedding-3-large)
- [x] Qdrant Vector Storage
- [x] Per-User Document Isolation

### 3. RAG Chatbot
- [x] Semantic Search with Similarity Threshold
- [x] Context-Only Answers (Strict RAG)
- [x] Source Citations
- [x] Greeting Detection ("Hi", "Hello")
- [x] Acknowledgment Detection ("okay thanks", "thank you")
- [x] Chat Sessions with SessionID
- [x] New Chat Button

### 4. Chat History
- [x] Session-based Chat Logs
- [x] Expand/Collapse Sessions
- [x] Per-User Log Filtering

### 5. Embeddable Widget
- [x] Unique Widget Key per User
- [x] Cross-Origin Support (CORS)
- [x] Embed Code Generator in Settings

---

## 🚀 Deployment Steps (VPS)

### Prerequisites
- VPS with Ubuntu 22.04
- Node.js 22 LTS
- Docker
- PM2
- Domain pointing to VPS

### Step 1: Clone Repository
```bash
cd /home/knowledgebase-admin/htdocs/knowledgebase
git clone https://github.com/Dinesh7be/KnowledgeBase.git
cd KnowledgeBase
```

### Step 2: Start Qdrant
```bash
docker compose up -d
```

### Step 3: Setup Backend
```bash
cd backend
npm install
nano .env  # Add environment variables (see .env.example)
pm2 start "npx tsx src/index.ts" --name "chat-backend"
```

### Step 4: Setup Frontend
```bash
cd ../frontend
npm install
nano .env.local  # Add NEXT_PUBLIC_API_URL
npm run build
pm2 start npm --name "chat-frontend" -- start -- -p 6100
pm2 save
```

### Step 5: Configure Hosting Panel
- Set App Port: `6100`
- Set Root Directory: `knowledgebase/KnowledgeBase/frontend`

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=6001
HOST=0.0.0.0
NODE_ENV=production
OPENAI_API_KEY=sk-your-key
QDRANT_URL=http://localhost:6333
JWT_SECRET=your-secret
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-user
SMTP_PASS=your-brevo-key
SMTP_FROM=your-email
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://knowledgebase.eduwhistle.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register/initiate` - Start registration
- `POST /api/auth/register/complete` - Verify OTP & create account
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request reset OTP
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List user documents
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats` - Get user stats

### Chat
- `POST /api/chat` - Send message (authenticated)
- `POST /api/chat/widget` - Send message (widget)
- `POST /api/chat/sessions` - Create session
- `GET /api/chat/sessions` - List sessions

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `GET /api/health` - Health check

---

## 🐛 Common Issues & Fixes

### Port 6000 Reserved
Next.js reserves port 6000 for X11. Use port 6100 instead.

### SMTP Authentication Failed
Verify Brevo SMTP credentials at https://app.brevo.com/settings/keys/smtp

### OpenAI API Key Invalid
Get valid key from https://platform.openai.com/api-keys

### 502 Bad Gateway
Check if PM2 apps are running: `pm2 list`

---

## 📊 PM2 Commands

```bash
pm2 list                    # Show all apps
pm2 logs chat-backend       # View backend logs
pm2 logs chat-frontend      # View frontend logs
pm2 restart chat-backend    # Restart backend
pm2 restart chat-frontend   # Restart frontend
pm2 save                    # Save PM2 config
pm2 startup                 # Enable auto-start on reboot
```

---

## 📅 Last Updated
December 17, 2025
