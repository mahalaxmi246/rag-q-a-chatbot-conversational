import os
import uuid
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import build_rag_chain, ask_question, get_chat_history, clear_session

app = FastAPI(title="RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5174","https://rag-q-a-chatbot-conversational-aqnhxnjd7-mahalaxmi246s-projects.vercel.app"],  # lock this down in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str
    question: str


class UploadResponse(BaseModel):
    session_id: str
    message: str


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    groq_api_key: str = "",
):
    if not groq_api_key:
        raise HTTPException(status_code=400, detail="Groq API key is required.")
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    session_id = str(uuid.uuid4())

    # Save to a temp file and build the chain
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        build_rag_chain(tmp_path, groq_api_key, session_id)
    finally:
        os.unlink(tmp_path)

    return UploadResponse(session_id=session_id, message="PDF processed successfully!")


@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        answer = ask_question(req.session_id, req.question)
        history = get_chat_history(req.session_id)
        return {"answer": answer, "history": history}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/history/{session_id}")
async def history(session_id: str):
    return {"history": get_chat_history(session_id)}


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    clear_session(session_id)
    return {"message": "Session cleared."}


@app.get("/")
def root():
    return {"status": "RAG Chatbot API is running"}
