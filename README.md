# Compliance & Policy Analyzer Chatbot (RAG-Based)

A production-grade, full-stack **Retrieval-Augmented Generation (RAG)** application designed to answer compliance questions strictly based on uploaded policy documents. This system ensures **zero hallucinations** by satisfying the "Answer not found" constraint when relevant information is missing.

---

## 🚀 Tech Stack

### Backend (Python)
*   **FastAPI**: High-performance async web framework.
*   **Groq API**: Ultra-fast inference using **LLaMA 3.1 (8B)**.
*   **LangChain**: Orchestration for RAG pipeline (retrieval, prompting).
*   **ChromaDB**: Local persistent vector database for semantic search.
*   **Sentence-Transformers**: `all-MiniLM-L6-v2` for generating embeddings.
*   **Pydantic**: Strict data validation and schema definitions.

### Frontend (TypeScript + React)
*   **Vite**: Next-generation frontend tooling.
*   **React 19**: Modern UI library with Hooks.
*   **TypeScript**: Static typing for robust code interaction (matching Pydantic schemas).
*   **Vanilla CSS + Variables**: Custom Design System without heavy external libraries.
*   **React Markdown**: Rich text rendering for AI responses.

---

## 📂 Project Structure & File Explanations

### Backend (`/backend`)
The backend exposes a single REST API endpoint (`POST /api/v1/chat`) that handles the RAG logic.

```text
backend/
├── app/
│   ├── api/
│   │   ├── chat.py             # Main router. Handles POST /chat, rate limiting, and errors.
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py           # Environment config (API keys, settings).
│   │   ├── rate_limiter.py     # Custom in-memory rate limiter (10 req/min).
│   │   └── security.py         # API Key validation dependency.
│   ├── models/
│   │   └── schemas.py          # Pydantic models (ChatRequest, ChatResponse, Citation).
│   ├── rag/
│   │   ├── embeddings.py       # Singleton Wrapper for Hugging Face Embeddings.
│   │   ├── generator.py        # Groq LLaMA client. Handles strict grounding.
│   │   ├── ingest.py           # Script to load PDF/Docs into ChromaDB.
│   │   ├── prompt.py           # Strict Prompt Template (injects context + strict rules).
│   │   └── retriever.py        # ChromaDB logic. Fetches top-k relevant chunks.
│   ├── services/
│   │   └── rag_service.py      # Orchestrator. Connects Retrieve -> Prompt -> Generate.
│   └── main.py                 # App Entrypoint. Middleware (CORS) & Route inclusion.
├── data/
│   └── chroma/                 # Persistent Vector Store (GitIgnored).
├── requirements.txt            # Python dependencies.
└── .env                        # Secrets (GROQ_API_KEY, API_KEY).
```

### Frontend (`/frontend`)
A professional SPA (Single Page Application) consuming the backend API.

```text
frontend/
├── src/
│   ├── api/
│   │   └── client.ts           # Axios-like fetch wrapper with Headers/Auth.
│   ├── components/
│   │   └── Chat/
│   │       ├── CitationBlock.tsx   # Displays sources with expand/collapse clamping.
│   │       ├── InputArea.tsx       # Message input + API Key setup + Suggestions.
│   │       ├── MessageBubble.tsx   # Markdown-rich message display (User/AI).
│   │       ├── MessageList.tsx     # Scrollable view + Thinking Indicator.
│   │       └── ThinkingBubble.tsx  # Multi-step animated loading state.
│   ├── hooks/
│   │   └── useChat.ts          # Orchestrator Hook. Managing state, API fetch, & error handling.
│   ├── styles/
│   │   ├── vars.css            # Design Tokens (Colors, Spacing, Typography).
│   │   └── main.css            # Global resets and utility classes.
│   ├── types/
│   │   └── api.ts              # TypeScript interfaces mirroring Backend Pydantic models.
│   ├── App.tsx                 # Main Layout & Integration.
│   └── main.tsx                # React Entrypoint.
├── index.html                  # HTML Shell.
├── package.json                # JS Dependencies.
└── vite.config.ts              # Build configuration.
```

---

## ⚙️ Logic Flow (The RAG Pipeline)

1.  **User Question**: Frontend sends `{"question": "..."}` to `POST /api/v1/chat`.
2.  **Security**: Backend validates `x-api-key` and checks Rate Limits.
3.  **Retrieval**:
    *   `EmbeddingModel` converts the question into a vector.
    *   `PolicyRetriever` queries **ChromaDB** for the top **7** most similar document chunks.
4.  **Prompt Engineering**:
    *   `build_prompt` combines the **System Rules** (strict grounding), **Retrieved Context**, and **User Question**.
5.  **Generation**:
    *   The prompt is sent to **Groq (LLaMA 3)**.
    *   Model generates an answer ONLY from the context.
    *   If context is insufficient, it returns a hardcoded **"Answer not found..."**.
6.  **Response**: Backend returns standard JSON with the **Answer** and **Citations**.
7.  **Frontend Render**:
    *   Displays "Thinking..." (Simulated steps).
    *   Renders Answer in Markdown.
    *   Renders Citations in a collapsible block.

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   Groq API Key (for LLM)

### 1. Backend Setup

```bash
cd backend

# Create Virtual Environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt

# Environment Variables
# Create a .env file with the following:
# GROQ_API_KEY=gsk_...
# API_KEY=my_secure_key

# Run Server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install Dependencies
npm install

# Run Dev Server
npm run dev
```

### 3. Verification
1.  Open `http://localhost:5173`.
2.  Click the **Key Icon** 🔑 in the top right.
3.  Enter the `API_KEY` defined in your backend `.env`.
4.  Ask a question: *"What are the data subject rights?"*

---

## ✨ Key Features
*   **Strict Grounding**: The bot refuses to answer questions outside its knowledge base.
*   **Citations**: Every answer comes with proof (Document Name + Page Number).
*   **Professional UI**:
    *   **Suggested Questions** chips for quick demos.
    *   **Multi-step Loading** purely for UX ("Scanning...", "Generating...").
    *   **Markdown Support** for clean lists and headers.
    *   **Expandable Sources** to keep the chat clean.
