# MiniGPT – AI Document Assistant

A lightweight, locally running AI-powered document assistant that allows users to upload PDF documents and ask questions using a Local Large Language Model (LLM).

MiniGPT uses Retrieval-Augmented Generation (RAG) to retrieve relevant document content and generate context-based answers without relying on cloud-based LLM APIs.

## Features

- PDF document upload
- PDF text extraction
- Automatic text chunking
- Relevant document context retrieval
- AI-powered question answering
- Local LLM integration using Ollama
- React-based chat interface
- FastAPI backend
- Retrieved document context display
- Answers questions using uploaded document content
- Handles questions when relevant information is unavailable

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| LLM Runtime | Ollama |
| Language Model | Qwen 2.5 1.5B |
| Document Processing | PyMuPDF |
| HTTP Client | Axios |
| UI Icons | Lucide React |

## Architecture

```text
                 USER
                   |
                   v
           React Frontend
                   |
                   v
             FastAPI Backend
                   |
                   v
             PDF Processing
                   |
                   v
             Text Extraction
                   |
                   v
             Text Chunking
                   |
                   v
          Relevant Context Retrieval
                   |
                   v
             Ollama Local LLM
                   |
                   v
             Qwen 2.5 1.5B
                   |
                   v
             Generated Answer
                   |
                   v
              React UI
```

## Project Structure

```text
MiniGPT/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── uploads/
│   └── venv/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following:

- Python 3.10 or later
- Node.js and npm
- Ollama
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/MiniGPT-AI-Document-Assistant.git
cd MiniGPT-AI-Document-Assistant
```

### 2. Download the local language model

```bash
ollama pull qwen2.5:1.5b
```

Verify the model:

```bash
ollama list
```

### 3. Setup the backend

```powershell
cd backend

python -m venv venv

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

Backend API:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 4. Setup the frontend

Open a second terminal:

```powershell
cd frontend

npm install

npm run dev
```

Frontend:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend health |
| POST | `/upload` | Upload a PDF |
| POST | `/ask` | Ask a question about a document |

### Upload PDF

Endpoint:

`POST /upload`

Request type: `multipart/form-data`

Parameter: `file`

### Ask a Question

Endpoint:

`POST /ask`

Example request:

```json
{
  "document_id": "YOUR_DOCUMENT_ID",
  "question": "Summarize this document."
}
```

## Testing

The MVP was tested with a sample PDF resume.

Test cases:

1. Generate a summary of the uploaded document.
2. Ask for information that is not present in the document.
3. Ask technical questions about the candidate's experience.
4. Retrieve factual information such as university and CGPA.

The application successfully returned document-based answers and indicated when requested information was unavailable.

## Hardware Considerations

This project was developed and tested on a computer with:

- 8 GB RAM
- Integrated graphics
- Local CPU-based LLM inference

A lightweight 1.5B-parameter model was selected to support local execution on modest hardware.

## Future Improvements

- Support multiple PDF documents
- Conversation history
- Page-level source citations
- Downloadable AI summaries
- Improved Markdown response rendering
- Document management
- Enhanced retrieval accuracy

## Privacy

MiniGPT uses a locally running Ollama model for inference. Uploaded documents are processed by the local backend.

For this development version, document storage is local and should not be treated as permanent storage.

## Learning Outcomes

This project demonstrates practical experience with:

- Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG)
- Prompt engineering
- PDF processing
- Python backend development
- React frontend development
- REST API integration
- Running AI models locally

## Author

**Sri Thirumalai Vasan S**

GitHub: https://github.com/Sri-Thirumalaivasan

---

If you find this project useful, consider giving it a star!