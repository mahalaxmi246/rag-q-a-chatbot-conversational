import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function uploadPDF(file, groqApiKey) {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${BASE}/upload?groq_api_key=${groqApiKey}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { session_id, message }
}

export async function sendMessage(sessionId, question) {
  const res = await axios.post(`${BASE}/chat`, {
    session_id: sessionId,
    question,
  });
  return res.data; // { answer, history }
}

export async function clearSession(sessionId) {
  await axios.delete(`${BASE}/session/${sessionId}`);
}