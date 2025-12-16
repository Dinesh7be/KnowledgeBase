# Chat Base - Complete Development Documentation

## 📋 Project Overview

**Chat Base** is a private Knowledge Base Chatbot application powered by RAG (Retrieval-Augmented Generation). It allows users to upload documents, ask questions, and get AI-powered answers based on the uploaded knowledge base.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js + React)                            │
│                   http://localhost:3000                          │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                          │
│  • /login - User authentication                                  │
│  • /register - User registration with OTP                        │
│  • /dashboard - Stats overview                                   │
│  • /knowledge-base - Document management                         │
│  • /chatbot - AI chat interface                                  │
│  • /chat-logs - Conversation history                            │
│  • /settings - System configuration                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    (Fastify + Node.js)                          │
│                   http://localhost:3001                          │
├─────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                      │
│  • /api/auth/* - Authentication (login, register, OTP, Google)  │
│  • /api/documents/* - Document upload & management               │
│  • /api/chat - AI chat with RAG                                  │
│  • /api/logs/* - Chat history                                    │
│  • /api/settings - Configuration                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│      OpenAI API     │         │       Qdrant        │
│   (Embeddings +     │         │  (Vector Database)  │
│    Chat Completions)│         │  localhost:6333     │
└─────────────────────┘         └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Auth**: @react-oauth/google, jwt-decode
- **Font**: Source Sans Pro

### Backend
- **Framework**: Fastify
- **Runtime**: Node.js with tsx
- **Validation**: Zod
- **Auth**: @fastify/jwt, bcrypt
- **File Upload**: @fastify/multipart
- **AI**: OpenAI API
- **Vector DB**: Qdrant

---

## 📁 Project Structure

```
ChatAi/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── knowledge-base/page.tsx
│   │   │   ├── chatbot/page.tsx
│   │   │   ├── chat-logs/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       ├── theme.tsx
│   │       ├── google-auth.tsx
│   │       └── utils.ts
│   ├── public/
│   │   └── logo.png
│   ├── .env
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── documents.ts
│   │   │   ├── logs.ts
│   │   │   └── settings.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── chat.service.ts
│   │   │   └── document.service.ts
│   │   ├── config/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── .env
│   └── package.json
│
└── sample_docs/
    └── (sample documents for testing)
```

---

## ⚙️ Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key
QDRANT_URL=http://localhost:6333
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Docker (for Qdrant)
- OpenAI API key
- Google OAuth Client ID (optional, for Google login)

### Step 1: Start Qdrant (Vector Database)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### Step 2: Setup Backend
```bash
cd backend
npm install
# Create .env file with required variables
npm run dev
```
Backend runs at: http://localhost:3001

### Step 3: Setup Frontend
```bash
cd frontend
npm install
# Create .env file with required variables
npm run dev
```
Frontend runs at: http://localhost:3000

---

## 🔐 Authentication Features

### Email/Password Login
- Standard email/password authentication
- JWT-based session management

### OTP Registration
1. User enters email and password
2. Backend generates 6-digit OTP (logged to console for testing)
3. User verifies OTP
4. Account is created

### Google OAuth
1. User clicks "Sign in with Google"
2. Google popup appears for authentication
3. User info is sent to backend
4. JWT token is issued

**Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000` to Authorized JavaScript origins
4. Add `http://localhost:3000` to Authorized redirect URIs
5. Copy Client ID to frontend `.env`

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user (direct) |
| POST | /api/auth/register/initiate | Start OTP registration |
| POST | /api/auth/register/verify | Verify OTP & complete registration |
| POST | /api/auth/resend-otp | Resend OTP |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/google | Google OAuth login |
| GET | /api/auth/me | Get current user (protected) |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload document |
| GET | /api/documents | List all documents |
| GET | /api/documents/:id | Get single document |
| DELETE | /api/documents/:id | Delete document |
| GET | /api/documents/stats | Get document statistics |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send chat message |

### Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/logs | Get paginated chat logs |
| GET | /api/logs/:id | Get single log |
| DELETE | /api/logs/:id | Delete log |
| DELETE | /api/logs | Clear all logs |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get settings |
| PUT | /api/settings | Update settings |
| POST | /api/settings/clear-vectors | Clear vector database |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |

---

## 🎨 UI Features

### Theme Support
- **Light Mode**: Clean white/gray design
- **Dark Mode**: Dark gray design
- Theme toggle in header
- Persists user preference

### Brand Colors
- Primary: `#E6602F` (Orange)
- Used in buttons, active states, accents

### Responsive Design
- Mobile-friendly layout
- Collapsible sidebar on smaller screens

---

## 📄 Supported Document Types

| Extension | MIME Type |
|-----------|-----------|
| .pdf | application/pdf |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| .txt | text/plain |
| .md | text/markdown |

---

## 🔄 RAG Flow

1. **Document Upload**
   - File is parsed and text extracted
   - Text is split into chunks
   - Each chunk is embedded using OpenAI embeddings
   - Embeddings stored in Qdrant

2. **Chat Query**
   - User question is embedded
   - Similar chunks retrieved from Qdrant
   - Context + question sent to OpenAI Chat
   - Response returned with source citations

---

## 🧪 Testing

### Test OTP Flow
1. Go to `/register`
2. Enter email and password
3. Check **backend terminal** for OTP code
4. Enter OTP to complete registration

### Test Chat
1. Upload a document in Knowledge Base
2. Go to Chatbot
3. Ask a question related to the document
4. Verify answer includes relevant context

### Test API
```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## 🚧 Known Limitations

1. **In-Memory Storage**: Users, documents, and logs are stored in memory. Restart clears data.
2. **OTP via Console**: OTPs are logged to console. Replace with email service for production.
3. **No Persistent Sessions**: JWT tokens are not refreshed automatically.

---

## 🔮 Future Enhancements

1. Database integration (PostgreSQL/MongoDB)
2. Real email service for OTP
3. Password reset functionality
4. User profile management
5. Document versioning
6. Conversation memory
7. Multi-language support
8. Admin dashboard

---

## 📞 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists with all required variables
- Check if Qdrant is running

### Frontend won't start
- Check if port 3000 is available
- Run `npm install` to ensure dependencies

### Google OAuth errors
- Wait 5 minutes after adding origins in Google Console
- Clear browser cache
- Verify Client ID is correct in `.env`

### Chat returns no context
- Ensure documents are uploaded
- Check if Qdrant is running
- Verify OpenAI API key is valid

---

## 📝 License

This project is for educational and demonstration purposes.

---

**Built with ❤️ using Next.js, Fastify, OpenAI, and Qdrant**
