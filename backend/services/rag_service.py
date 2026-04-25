import json
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.models import PolicyDocument, PolicyChunk
from services.ollama_service import ollama_service
from core.config import get_settings

settings = get_settings()

RAG_SYSTEM_PROMPT = """You are an HR policy assistant. Answer questions based ONLY on the provided policy document excerpts.
If the answer cannot be found in the provided excerpts, say: "I could not find this in the uploaded policy documents."
Do not make up information. Do not use outside knowledge.
Always cite the source document and section when providing an answer.
Be concise but thorough."""

RAG_ANSWER_PROMPT = """Answer the following question using ONLY the provided policy excerpts.

POLICY EXCERPTS:
{context}

QUESTION: {question}

Provide your answer with citations to the specific documents and sections."""


class RAGService:
    def __init__(self, db: Session):
        self.db = db

    async def ingest_document(self, document: PolicyDocument, chunks: List[str]):
        embeddings = await ollama_service.embed(chunks)

        for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
            embedding_bytes = np.array(embedding, dtype=np.float32).tobytes()

            chunk = PolicyChunk(
                document_id=document.id,
                chunk_text=chunk_text,
                embedding=embedding_bytes,
                chunk_index=idx,
                section_title=f"Section {idx + 1}",
            )
            self.db.add(chunk)

        self.db.commit()

    async def retrieve_chunks(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_embedding = await ollama_service.embed([query])
        query_vec = np.array(query_embedding[0], dtype=np.float32)

        # For SQLite fallback, simple text search
        if "sqlite" in settings.DATABASE_URL:
            chunks = self.db.query(PolicyChunk).all()
            results = []
            for chunk in chunks:
                if chunk.embedding:
                    chunk_vec = np.frombuffer(chunk.embedding, dtype=np.float32)
                    similarity = np.dot(query_vec, chunk_vec) / (
                        np.linalg.norm(query_vec) * np.linalg.norm(chunk_vec)
                    )
                    results.append(
                        {
                            "text": chunk.chunk_text,
                            "document_id": chunk.document_id,
                            "section": chunk.section_title,
                            "similarity": float(similarity),
                        }
                    )
            results.sort(key=lambda x: x["similarity"], reverse=True)
            return results[:top_k]

        # PostgreSQL with pgvector
        query_vec_list = query_vec.tolist()
        sql = text("""
            SELECT pc.id, pc.chunk_text, pc.section_title, pc.document_id,
                   pc.embedding <=> :query_vec as distance
            FROM policy_chunks pc
            ORDER BY pc.embedding <=> :query_vec
            LIMIT :limit
        """)

        results = []
        # Note: pgvector query would go here with proper vector serialization
        # For now, fallback to the text-based approach
        chunks = self.db.query(PolicyChunk).limit(100).all()
        for chunk in chunks:
            if chunk.embedding:
                chunk_vec = np.frombuffer(chunk.embedding, dtype=np.float32)
                similarity = np.dot(query_vec, chunk_vec) / (
                    np.linalg.norm(query_vec) * np.linalg.norm(chunk_vec) + 1e-8
                )
                results.append(
                    {
                        "text": chunk.chunk_text,
                        "document_id": chunk.document_id,
                        "section": chunk.section_title,
                        "similarity": float(similarity),
                    }
                )
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    async def answer_question(self, question: str, top_k: int = 5) -> Dict[str, Any]:
        chunks = await self.retrieve_chunks(question, top_k)

        if not chunks or chunks[0]["similarity"] < 0.5:
            return {
                "answer": "I could not find this in the uploaded policy documents.",
                "sources": [],
                "confidence": "low",
            }

        context = "\n\n".join(
            [
                f"[{i + 1}] {chunk['section']} (Document {chunk['document_id']}): {chunk['text']}"
                for i, chunk in enumerate(chunks)
            ]
        )

        prompt = RAG_ANSWER_PROMPT.format(context=context, question=question)
        answer = await ollama_service.generate(
            prompt, system=RAG_SYSTEM_PROMPT, temperature=0.3
        )

        sources = [
            {
                "document_id": c["document_id"],
                "section": c["section"],
                "similarity": c["similarity"],
            }
            for c in chunks
        ]

        return {
            "answer": answer,
            "sources": sources,
            "confidence": "high" if chunks[0]["similarity"] > 0.7 else "medium",
        }
