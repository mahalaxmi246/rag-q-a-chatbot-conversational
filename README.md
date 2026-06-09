# 📄 DocChat — RAG Chatbot with Conversation History

> Upload any PDF and have a real conversation with it. Powered by **LangChain**, **Groq**, and **HuggingFace** — built with **React** + **FastAPI**.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge)

Visit: https://rag-q-a-chatbot-conversational.vercel.app/

---

## ✨ What It Does

DocChat lets you upload a PDF document and ask questions about it in a natural conversation. It remembers what you said earlier in the chat, so follow-up questions just work — no need to repeat context.

**Example:**
> You: *"What are the candidate's technical skills?"*
> Bot: *"The candidate is proficient in Python, React, and..."*
> You: *"Which of those are most relevant for a data role?"*
> Bot: *(understands you're still talking about the same candidate)*

---

## 🏗️ Architecture

```
┌─────────────────┐        ┌──────────────────────────────────────┐
│                 │        │           FastAPI Backend             │
│  React Frontend │◄──────►│                                      │
│   (Vite + JSX)  │  HTTP  │  ┌─────────────┐  ┌──────────────┐  │
│                 │        │  │  LangChain  │  │   ChromaDB   │  │
└─────────────────┘        │  │  RAG Chain  │  │ Vector Store │  │
                           │  └──────┬──────┘  └──────┬───────┘  │
                           │         │                 │          │
                           │  ┌──────▼──────┐  ┌──────▼───────┐  │
                           │  │  Groq LLM   │  │  HuggingFace │  │
                           │  │(llama-3.3)  │  │  Embeddings  │  │
                           │  └─────────────┘  └──────────────┘  │
                           └──────────────────────────────────────┘
```

**How RAG works here:**
1. PDF is uploaded → split into chunks → embedded → stored in ChromaDB
2. User asks a question → history-aware retriever reformulates it as a standalone query
3. Relevant chunks are retrieved → passed to the LLM with chat history
4. LLM generates a grounded, concise answer

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | FastAPI, Uvicorn |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| Vector Store | ChromaDB (in-memory) |
| RAG Framework | LangChain |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Groq API Key](https://console.groq.com) (free)
- [HuggingFace Token](https://huggingface.co/settings/tokens) (free)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/rag-chatbot.git
cd rag-chatbot
```

---

### 2. Run the Backend

```bash
cd backend
```

Create a `.env` file:
```env
HF_TOKEN=your_huggingface_token_here
```

Install dependencies and start:
```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
Interactive API docs at `http://localhost:8000/docs`

---

### 3. Run the Frontend

```bash
cd frontend
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

Install and start:
```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📁 Project Structure

```
rag-chatbot/
│
├── backend/
│   ├── main.py          # FastAPI routes (upload, chat, history, clear)
│   ├── rag.py           # LangChain RAG pipeline & session management
│   ├── requirements.txt
│   └── .env             # HF_TOKEN (never commit this)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main UI component
│   │   └── api.js       # Axios API calls
│   ├── package.json
│   └── .env             # VITE_API_URL (never commit this)
│
└── README.md
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload a PDF + Groq API key, get a `session_id` |
| `POST` | `/chat` | Send a question with `session_id`, get an answer |
| `GET` | `/history/{session_id}` | Retrieve full chat history |
| `DELETE` | `/session/{session_id}` | Clear session and free memory |
| `GET` | `/` | Health check |

**Upload example:**
```bash
curl -X POST "http://localhost:8000/upload?groq_api_key=gsk_xxx" \
  -F "file=@resume.pdf"
```

**Chat example:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "your-session-id", "question": "What are the main skills?"}'
```

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add environment variable: `HF_TOKEN = your_token`
6. Deploy 🎉

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variable: `VITE_API_URL = https://your-render-url.onrender.com`
4. Deploy 🎉

---

## 🔒 Environment Variables

| Variable | Where | Description |
|---|---|---|
| `HF_TOKEN` | `backend/.env` | HuggingFace token for embeddings |
| `VITE_API_URL` | `frontend/.env` | URL of the FastAPI backend |

> Both `.env` files are in `.gitignore` — never commit real keys.

---

## 💡 How Sessions Work

Each PDF upload creates a unique `session_id` (UUID). This means:
- Multiple users can upload different PDFs simultaneously
- Chat history is isolated per session
- Clearing a session frees all memory for that PDF

---

## 🙋 Author

**Mahalaxmi Somisetty**

Built as a full-stack AI project — RAG pipeline, REST API, and responsive React UI from scratch.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username)
