
import os
import uuid
from pathlib import Path

import pymupdf
import ollama

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = FastAPI(title="MiniGPT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = "qwen2.5:1.5b"

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Temporary in-memory document storage
documents = {}


class QuestionRequest(BaseModel):
    document_id: str
    question: str


def extract_pdf_text(file_path):
    doc = pymupdf.open(file_path)

    text = "\n".join(
        page.get_text("text") for page in doc
    )

    doc.close()
    return text


def split_text(text, chunk_size=900, overlap=150):
    chunks = []

    start = 0

    while start < len(text):
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def retrieve_chunks(chunks, question, top_k=3):
    if not chunks:
        return []

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    try:
        matrix = vectorizer.fit_transform(
            chunks + [question]
        )
    except ValueError:
        return []

    scores = cosine_similarity(
        matrix[-1],
        matrix[:-1]
    ).flatten()

    ranked = scores.argsort()[::-1][:top_k]

    return [
        chunks[i]
        for i in ranked
        if scores[i] > 0
    ]


@app.get("/")
def home():
    return {"message": "MiniGPT API running"}


@app.get("/health")
def health():
    try:
        ollama.list()
        return {
            "status": "healthy",
            "model": MODEL
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not available"
        )


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF must be smaller than 10 MB"
        )

    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file"
        )

    document_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{document_id}.pdf"

    try:
        file_path.write_bytes(content)

        text = extract_pdf_text(file_path)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in PDF"
            )

        chunks = split_text(text)

        documents[document_id] = {
            "name": file.filename,
            "chunks": chunks
        }

        return {
            "document_id": document_id,
            "filename": file.filename,
            "total_chunks": len(chunks),
            "message": "PDF uploaded successfully"
        }

    except HTTPException:
        file_path.unlink(missing_ok=True)
        raise

    except Exception as error:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.post("/ask")
def ask_question(request: QuestionRequest):

    document = documents.get(request.document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found. Upload again."
        )

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    chunks = retrieve_chunks(
        document["chunks"],
        request.question
    )

    if not chunks:
        return {
            "answer": "I could not find relevant information in this document.",
            "sources": []
        }

    context = "\n\n".join(chunks)

    prompt = f"""
You are MiniGPT, a document assistant.

Answer using ONLY the document context below.

If the answer is not available in the context,
say that the information is not present in the document.

DOCUMENT CONTEXT:
{context}

QUESTION:
{request.question}

ANSWER:
"""

    try:
        response = ollama.chat(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            options={
                "temperature": 0.2
            }
        )

        return {
            "answer": response.message.content,
            "sources": chunks
        }

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"LLM generation failed: {str(error)}"
        )
