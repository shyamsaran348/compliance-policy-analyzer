# backend/app/services/rag_service.py

from typing import Dict, List
from fastapi import HTTPException

from app.rag.retriever import PolicyRetriever
from app.rag.prompt import build_prompt
from app.rag.generator import LLMGenerator
from app.services.workspace_service import workspace_service

REFUSAL_RESPONSE = "Answer not found in the provided documents."


class RAGService:
    def __init__(self):
        # Generator is global/shared
        self.generator = LLMGenerator()

    def run(self, question: str, workspace_id: str) -> Dict:
        # Step 0: Validate Workspace & Init Retriever
        workspace = workspace_service.get_workspace(workspace_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        # Consistent naming convention from WorkspaceService
        collection_name = f"workspace_{workspace.id}"
        
        # Initialize scoped retriever (Note: In high-scale, cache this)
        try:
            retriever = PolicyRetriever(collection_name=collection_name, k=7)
        except FileNotFoundError:
             raise HTTPException(status_code=404, detail="Workspace vector store not found")

        # Step 1: Retrieve relevant documents
        docs = retriever.retrieve(question)

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
