# backend/app/services/rag_service.py

from typing import Dict, List

from app.rag.retriever import PolicyRetriever
from app.rag.prompt import build_prompt
from app.rag.generator import LLMGenerator

REFUSAL_RESPONSE = "Answer not found in the provided documents."


class RAGService:
    def __init__(self):
        self.retriever = PolicyRetriever(k=3)
        self.generator = LLMGenerator()

    def run(self, question: str) -> Dict:
        # Step 1: Retrieve relevant documents
        docs = self.retriever.retrieve(question)

        if not docs:
            return {
                "answer": REFUSAL_RESPONSE,
                "citations": []
            }

        # Step 2: Build grounded prompt
        prompt = build_prompt(question, docs)

        # Step 3: Generate answer
        answer = self.generator.generate(prompt)

        # Step 4: Enforce refusal rule
        if answer.strip() == REFUSAL_RESPONSE:
            return {
                "answer": REFUSAL_RESPONSE,
                "citations": []
            }

        # Step 5: Build citations from metadata
        citations: List[Dict] = []
        for doc in docs:
            citations.append({
                "doc_name": doc.metadata.get("doc_name"),
                "page_number": doc.metadata.get("page_number"),
                "snippet": doc.page_content.strip()
            })

        return {
            "answer": answer,
            "citations": citations
        }
