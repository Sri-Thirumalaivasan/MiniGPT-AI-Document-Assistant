import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Bot,
  Send,
  Upload,
  FileText,
  Plus,
  Trash2,
  LoaderCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const MODEL_LABEL = "Gemini AI";

function App() {
  const [document, setDocument] = useState(null);
  const [documentId, setDocumentId] = useState("");
  const [totalChunks, setTotalChunks] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const uploadPDF = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/upload`, formData);
      const newDocumentId = response.data.document_id;

      if (!newDocumentId) {
        throw new Error("The backend did not return a document ID.");
      }

      setDocument(file.name);
      setDocumentId(newDocumentId);
      setTotalChunks(response.data.total_chunks ?? null);
      setMessages([
        {
          role: "assistant",
          text: `I've processed "${file.name}". You can now ask questions about this document.`,
        },
      ]);
      setQuestion("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "PDF upload failed. Check that the FastAPI backend is running."
      );
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const currentQuestion = question.trim();
    if (!currentQuestion || loading || uploading) return;

    if (!documentId) {
      setError("Upload a PDF before asking a question.");
      return;
    }

    setError("");
    setMessages((prev) => [...prev, { role: "user", text: currentQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ask`, {
        document_id: documentId,
        question: currentQuestion,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.data.answer || "The model returned an empty answer.",
          sources: Array.isArray(response.data.sources) ? response.data.sources : [],
        },
      ]);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Something went wrong while generating the answer. Check Ollama and the backend terminal.";

      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${detail}` }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setDocument(null);
    setDocumentId("");
    setTotalChunks(null);
    setMessages([]);
    setQuestion("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openFilePicker = () => fileRef.current?.click();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={25} />
          </div>
          <div>
            <h2>MiniGPT</h2>
            <span className="brand-caption">AI DOCUMENT ASSISTANT</span>
          </div>
        </div>

        <button className="new-chat" onClick={resetChat} type="button">
          <Plus size={18} />
          New conversation
        </button>

        <div className="sidebar-section">
          <p className="section-label">YOUR DOCUMENT</p>

          {document ? (
            <div className="document-item">
              <FileText size={18} />
              <div className="document-details">
                <span className="document-name">{document}</span>
                <span className="document-meta">
                  {totalChunks !== null ? `${totalChunks} text chunks` : "Uploaded"}
                </span>
              </div>
            </div>
          ) : (
            <span className="empty-label">No document uploaded</span>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="model-status">
            <span className="status-dot" />
            <div>
              <strong>Local AI model</strong>
              <span>{MODEL_LABEL}</span>
            </div>
          </div>
          <p className="privacy-note">Your document is processed by your local backend.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <h3>Document Assistant</h3>
            <p>Ask questions and explore your PDF with local AI</p>
          </div>

          <div className="topbar-actions">
            {document && (
              <span className="document-ready">
                <CheckCircle2 size={15} /> Document ready
              </span>
            )}
            <button
              className="icon-button"
              onClick={resetChat}
              title="Clear conversation and document"
              aria-label="Clear conversation and document"
              type="button"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        <section className="chat-area">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">
                <Sparkles size={34} />
              </div>
              <span className="eyebrow">YOUR PERSONAL PDF ASSISTANT</span>
              <h1>Welcome to MiniGPT</h1>
              <p>
                Upload a PDF and ask questions. MiniGPT retrieves relevant
                passages and uses your local language model to answer.
              </p>
              <button
                className="upload-button"
                onClick={openFilePicker}
                disabled={uploading}
                type="button"
              >
                {uploading ? (
                  <LoaderCircle className="spin" size={19} />
                ) : (
                  <Upload size={19} />
                )}
                {uploading ? "Processing PDF..." : "Upload PDF"}
              </button>
              <span className="supported-format">PDF files only</span>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message-row ${message.role}`}>
              <div className="avatar">
                {message.role === "assistant" ? <Bot size={20} /> : "Y"}
              </div>

              <div className="message-content">
                <strong>{message.role === "assistant" ? "MiniGPT" : "You"}</strong>
                <p>{message.text}</p>

                {message.sources?.length > 0 && (
                  <details className="sources">
                    <summary>View retrieved document context ({message.sources.length})</summary>
                    {message.sources.map((source, sourceIndex) => (
                      <p key={sourceIndex}>{source}</p>
                    ))}
                  </details>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing">
              <LoaderCircle className="spin" size={18} />
              MiniGPT is thinking. A local model may take a little time...
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={(event) => {
              uploadPDF(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </section>

        <form className="input-area" onSubmit={sendMessage}>
          <button
            className="attach-button"
            onClick={openFilePicker}
            disabled={uploading || loading}
            title="Upload PDF"
            aria-label="Upload PDF"
            type="button"
          >
            {uploading ? <LoaderCircle className="spin" size={20} /> : <Upload size={20} />}
          </button>

          <input
            type="text"
            placeholder={
              documentId ? "Ask something about your document..." : "Upload a PDF to start..."
            }
            value={question}
            disabled={!documentId || loading || uploading}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="Ask a question about your document"
          />

          <button
            className="send-button"
            type="submit"
            disabled={!question.trim() || !documentId || loading || uploading}
            aria-label="Send question"
            title="Send question"
          >
            <Send size={19} />
          </button>
        </form>

        <p className="disclaimer">
          MiniGPT can make mistakes. Verify important information. · Powered by {MODEL_LABEL}
        </p>
      </main>
    </div>
  );
}

export default App;
