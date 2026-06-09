import { useState, useRef, useEffect } from "react";
import { uploadPDF, sendMessage, clearSession } from "./api";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!apiKey.trim()) {
      setStatus("Enter your Groq API key first.");
      setStatusType("error");
      return;
    }
    setUploading(true);
    setStatus("Reading your PDF…");
    setStatusType("info");
    setFileName(file.name);
    try {
      const data = await uploadPDF(file, apiKey);
      setSessionId(data.session_id);
      setMessages([]);
      setStatus(`"${file.name}" is ready.`);
      setStatusType("success");
    } catch (err) {
      setStatus(err.response?.data?.detail || "Upload failed. Check your API key.");
      setStatusType("error");
    }
    setUploading(false);
  }

  async function handleSend() {
    const q = input.trim();
    if (!q || !sessionId || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "human", content: q }]);
    setLoading(true);
    try {
      const data = await sendMessage(sessionId, q);
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    } catch{
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong. Please try again.", error: true },
      ]);
    }
    setLoading(false);
  }

  async function handleClear() {
    if (sessionId) await clearSession(sessionId);
    setSessionId(null);
    setMessages([]);
    setStatus("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #F5EDE0;
          color: #2C1A0E;
          min-height: 100vh;
        }

        .app {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #F5EDE0;
          position: relative;
        }

        /* ── Overlay for mobile ── */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(44,26,14,0.35);
          z-index: 10;
        }
        .overlay.open { display: block; }

        /* ── Sidebar ── */
        .sidebar {
          width: 340px;
          flex-shrink: 0;
          background: #EFE3D0;
          border-right: 1.5px solid #C4A882;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          gap: 24px;
          overflow-y: auto;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          z-index: 20;
        }

        .divider { height: 1px; background: #C4A882; }

        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #A8957E;
          margin-bottom: 8px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          width: 38px;
          height: 38px;
          background: #B5532A;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 21px;
          font-weight: 600;
          color: #2C1A0E;
          letter-spacing: -0.3px;
        }

        .api-input {
          width: 100%;
          background: #F5EDE0;
          border: 1.5px solid #C4A882;
          border-radius: 9px;
          padding: 11px 14px;
          color: #2C1A0E;
          font-size: 13.5px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .api-input:focus {
          border-color: #B5532A;
          box-shadow: 0 0 0 3px rgba(181,83,42,0.1);
        }
        .api-input::placeholder { color: #C4B09A; }

        .upload-area {
          border: 2px dashed #B8956A;
          border-radius: 12px;
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          background: rgba(245,237,224,0.5);
        }
        .upload-area:hover {
          border-color: #B5532A;
          background: rgba(181,83,42,0.05);
        }
        .upload-icon {
          width: 38px;
          height: 38px;
          background: #EFE3D0;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .upload-title { font-size: 13.5px; font-weight: 500; color: #5C3D28; }
        .upload-sub { font-size: 11.5px; color: #A8957E; }

        .status-badge {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 10px 13px;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.5;
        }
        .status-badge.success { background: rgba(100,160,100,0.12); color: #4A7A4A; border: 1px solid rgba(100,160,100,0.28); }
        .status-badge.error   { background: rgba(181,83,42,0.1);   color: #B5532A; border: 1px solid rgba(181,83,42,0.25); }
        .status-badge.info    { background: rgba(181,83,42,0.07);  color: #8C4422; border: 1px solid rgba(181,83,42,0.15); }

        .clear-btn {
          margin-top: auto;
          background: transparent;
          border: 1.5px solid #C4A882;
          border-radius: 9px;
          padding: 11px 14px;
          color: #A8957E;
          font-size: 13.5px;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .clear-btn:hover { border-color: #B5532A; color: #B5532A; background: rgba(181,83,42,0.05); }

        /* ── Main ── */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #F5EDE0;
        }

        .chat-header {
          padding: 18px 28px;
          border-bottom: 1.5px solid #C4A882;
          display: flex;
          align-items: center;
          gap: 14px;
          background: #F5EDE0;
        }

        /* hamburger — hidden on desktop */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 4px;
          flex-shrink: 0;
          background: none;
          border: none;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #B5532A;
          border-radius: 2px;
          transition: all 0.25s;
        }

        .header-info { flex: 1; min-width: 0; }
        .chat-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: #2C1A0E;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-header-sub { font-size: 11.5px; color: #A8957E; margin-top: 2px; }

        .model-chip {
          background: #EFE3D0;
          border: 1.5px solid #C4A882;
          border-radius: 20px;
          padding: 4px 13px;
          font-size: 11px;
          color: #A8957E;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .chat-window {
          flex: 1;
          overflow-y: auto;
          padding: 30px 36px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          scrollbar-width: thin;
          scrollbar-color: #C4A882 transparent;
        }
        .chat-window::-webkit-scrollbar { width: 4px; }
        .chat-window::-webkit-scrollbar-thumb { background: #C4A882; border-radius: 4px; }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          text-align: center;
          padding: 40px;
        }
        .empty-icon { font-size: 52px; opacity: 0.38; }
        .empty-title { font-family: 'Playfair Display', serif; font-size: 19px; color: #A8957E; }
        .empty-sub { font-size: 13px; color: #C4B09A; max-width: 310px; line-height: 1.75; }

        .msg-row { display: flex; gap: 10px; align-items: flex-end; animation: fadeUp 0.2s ease; }
        .msg-row.human { flex-direction: row-reverse; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
          margin-bottom: 2px;
          font-family: 'Playfair Display', serif;
        }
        .avatar.human { background: #B5532A; color: #FFF8F2; }
        .avatar.assistant { background: #EFE3D0; color: #8C4422; border: 1.5px solid #C4A882; }

        .bubble {
          max-width: 66%;
          padding: 13px 17px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.75;
          word-break: break-word;
        }
        .bubble.human {
          background: #B5532A;
          color: #FFF8F2;
          border-bottom-right-radius: 4px;
        }
        .bubble.assistant {
          background: #EFE3D0;
          color: #2C1A0E;
          border: 1.5px solid #C4A882;
          border-bottom-left-radius: 4px;
        }
        .bubble.error { background: rgba(181,83,42,0.08); border-color: rgba(181,83,42,0.22); color: #8C4422; }

        .typing-indicator { display: flex; gap: 5px; align-items: center; padding: 4px 2px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: #B5532A; opacity: 0.4; animation: bounce 1.3s infinite; }
        .dot:nth-child(2) { animation-delay: 0.18s; }
        .dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-6px); opacity: 0.9; }
        }

        /* ── Input ── */
        .input-bar {
          padding: 16px 36px 24px;
          background: #F5EDE0;
          border-top: 1.5px solid #C4A882;
        }
        .input-wrap {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: #EFE3D0;
          border: 1.5px solid #C4A882;
          border-radius: 14px;
          padding: 10px 10px 10px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-wrap:focus-within {
          border-color: #B5532A;
          box-shadow: 0 0 0 3px rgba(181,83,42,0.1);
        }
        .chat-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #2C1A0E;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          line-height: 1.5;
          max-height: 130px;
          min-height: 22px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .chat-textarea::placeholder { color: #C4B09A; }
        .chat-textarea:disabled { opacity: 0.5; }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #B5532A;
          color: #FFF8F2;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
        }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
        .send-btn:not(:disabled):hover { opacity: 0.88; transform: scale(1.05); }

        .input-hint { font-size: 11px; color: #C4B09A; margin-top: 8px; text-align: center; }

        .spin {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,248,242,0.3);
          border-top-color: #FFF8F2;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Mobile ── */
        @media (max-width: 860px) {
          .hamburger { display: flex; }

          .sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(44,26,14,0.15);
          }
          .sidebar.open { transform: translateX(0); }

          .chat-header { padding: 14px 16px; }
          .chat-window { padding: 16px; gap: 16px; }
          .bubble { max-width: 84%; }
          .input-bar { padding: 12px 16px 18px; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="app">
        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="logo">
            <div className="logo-icon">📄</div>
            <span className="logo-text">DocChat</span>
          </div>

          <div className="divider" />

          <div>
            <p className="section-label">Groq API Key</p>
            <input
              className="api-input"
              type="password"
              placeholder="gsk_••••••••••••"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <p className="section-label">Document</p>
            <label className="upload-area">
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} hidden />
              {uploading ? (
                <>
                  <div className="upload-icon">
                    <div className="spin" style={{ borderTopColor: "#B5532A", borderColor: "rgba(181,83,42,0.2)" }} />
                  </div>
                  <span className="upload-title">Processing…</span>
                </>
              ) : fileName ? (
                <>
                  <div className="upload-icon">📎</div>
                  <span className="upload-title" style={{ color: "#B5532A" }}>
                    {fileName.length > 26 ? fileName.slice(0, 26) + "…" : fileName}
                  </span>
                  <span className="upload-sub">Click to replace</span>
                </>
              ) : (
                <>
                  <div className="upload-icon">☁️</div>
                  <span className="upload-title">Upload a PDF</span>
                  <span className="upload-sub">Click to browse</span>
                </>
              )}
            </label>

            {status && (
              <div className={`status-badge ${statusType}`} style={{ marginTop: 10 }}>
                <span>{statusType === "success" ? "✓" : statusType === "error" ? "✕" : "·"}</span>
                <span>{status}</span>
              </div>
            )}
          </div>

          <div className="divider" />

          {sessionId && (
            <button className="clear-btn" onClick={handleClear}>↺ New conversation</button>
          )}
        </aside>

        {/* Main */}
        <main className="main">
          <div className="chat-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
            <div className="header-info">
              <div className="chat-header-title">
                {fileName ? fileName.replace(".pdf", "") : "Ready to chat"}
              </div>
              <div className="chat-header-sub">
                {sessionId
                  ? `${messages.length} message${messages.length !== 1 ? "s" : ""}`
                  : "Upload a PDF to get started"}
              </div>
            </div>
            <div className="model-chip">llama-3.3-70b</div>
          </div>

          <div className="chat-window">
            {messages.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <div className="empty-title">
                  {sessionId ? "Ask your first question" : "No document yet"}
                </div>
                <div className="empty-sub">
                  {sessionId
                    ? "Ask anything about your PDF. I'll find the relevant passages and answer concisely."
                    : "Upload a PDF from the sidebar and start a conversation with its content."}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                <div className={`avatar ${msg.role}`}>{msg.role === "human" ? "U" : "A"}</div>
                <div className={`bubble ${msg.role}${msg.error ? " error" : ""}`}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="msg-row assistant">
                <div className="avatar assistant">A</div>
                <div className="bubble assistant">
                  <div className="typing-indicator">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="input-bar">
            <div className="input-wrap">
              <textarea
                className="chat-textarea"
                placeholder={sessionId ? "Ask something about your document…" : "Upload a PDF to start chatting"}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
                }}
                onKeyDown={handleKeyDown}
                disabled={!sessionId || loading}
                rows={1}
              />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim() || !sessionId || loading}>
                {loading ? <div className="spin" /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
            <p className="input-hint">Enter to send · Shift+Enter for new line</p>
          </div>
        </main>
      </div>
    </>
  );
}