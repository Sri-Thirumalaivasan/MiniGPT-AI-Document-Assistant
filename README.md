# MiniGPT – AI Document Assistant

A lightweight, locally running AI-powered document assistant that lets users upload PDF documents and ask questions using a local large language model (LLM).

MiniGPT uses a retrieval-augmented generation (RAG) workflow: it extracts PDF text, splits it into chunks, retrieves relevant passages, and sends those passages to a locally running Ollama model.

## Features

- PDF document upload and text extraction
- Automatic text chunking
- TF-IDF-based relevant context retrieval
- AI-powered question answering using local Ollama
- React chat interface and FastAPI backend
- Retrieved document context displayed with answers
- Handles questions when relevant information is unavailable in retrieved context

## Technology stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| LLM runtime | Ollama |
| Language model | Qwen 2.5 1.5B |
| PDF processing | PyMuPDF |
| Retrieval | scikit-learn TF-IDF and cosine similarity |
| HTTP client | Axios |
| UI icons | Lucide React |

## Project structure

```text
MiniGPT-AI-Document-Assistant/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

Uploaded files are stored locally under `backend/uploads/` at runtime. This directory, virtual environments, Python cache files, and PDF files are excluded from Git.

## Prerequisites

- Python 3.10 or later
- Node.js and npm
- [Ollama](https://ollama.com/)
- Git

## Installation and setup

### 1. Clone the repository

```bash
git clone https://github.com/Sri-Thirumalaivasan/MiniGPT-AI-Document-Assistant.git
cd MiniGPT-AI-Document-Assistant
```

### 2. Download the local language model

Make sure Ollama is installed and running, then execute:

```bash
ollama pull qwen2.5:1.5b
ollama list
```

### 3. Set up the backend

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000`.

Interactive API documentation: `http://127.0.0.1:8000/docs`.

### 4. Set up the frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic API status |
| GET | `/health` | Check backend and Ollama availability |
| POST | `/upload` | Upload and process a PDF |
| POST | `/ask` | Ask a question about an uploaded document |

### Upload a PDF

Send a `multipart/form-data` request to `/upload` with a `file` field containing the PDF.

### Ask a question

Send JSON to `/ask`:

```json
{
  "document_id": "DOCUMENT_ID_FROM_UPLOAD",
  "question": "Summarize this document."
}
```

## Notes and limitations

- The current implementation keeps document chunk metadata in memory. Restarting the backend clears the active document sessions; upload the PDF again after a restart.
- Uploaded PDFs are stored locally in `backend/uploads/`. Do not commit private documents or real user uploads.
- The frontend currently expects the backend at `http://127.0.0.1:8000` and uses the Vite development origin `http://localhost:5173` for CORS.
- Ollama must be running locally and the configured model must be available before asking questions.
- Retrieval uses TF-IDF and cosine similarity; answer quality depends on the extracted PDF text and retrieved context.

## Future improvements

- Multiple document sessions and persistent document metadata
- Conversation history
- Page-level source citations
- Downloadable AI summaries
- Improved Markdown response rendering
- Document management and configurable backend URL
- More advanced semantic retrieval

## Learning outcomes

This project demonstrates practical experience with:

- Large language models and local inference
- Retrieval-augmented generation concepts
- Prompt engineering
- PDF processing and text chunking
- Python backend development with FastAPI
- React frontend development
- REST API integration

## Author

**Sri Thirumalai Vasan S**

GitHub: https://github.com/Sri-Thirumalaivasan
