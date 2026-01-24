from typing import Dict, List, Optional
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
        # Retriever lazy init
        self._retriever: Optional[PolicyRetriever] = None

    @property
    def retriever(self) -> PolicyRetriever:
        if self._retriever is None:
            self._retriever = PolicyRetriever(k=7)
        return self._retriever

    def run(self, question: str, workspace_id: str) -> Dict:
        # Step 0: Validate Workspace & Get Filenames
        workspace = workspace_service.get_workspace(workspace_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        filenames = workspace_service.get_workspace_filenames(workspace_id)
        
        if not filenames:
             return {
                "answer": "This workspace has no documents associated with it.",
                "citations": []
            }

        # Step 1: build filter
        # Pinecone "in" filter: {"doc_name": {"$in": ["a.pdf", "b.pdf"]}}
        # If there are many files, this might hit filter limits, but fine for Vercel demo.
        search_filter = {"doc_name": {"$in": filenames}}

        # Step 2: Retrieve relevant documents
        try:
            docs = self.retriever.retrieve(question, filter=search_filter)
        except Exception as e:
            # Handle Pinecone errors (like index not ready)
            print(f"Retrieval error: {e}")
            return {
                "answer": f"Error retrieving documents: {str(e)}",
                "citations": []
            }

        if not docs:
            return {
                "answer": f"{REFUSAL_RESPONSE} (Debug: Retrieved 0 documents from Pinecone. Index might be empty or filter mismatch.)",
                "citations": []
            }

        # Step 3: Build grounded prompt
        prompt = build_prompt(question, docs)

        # Step 4: Generate answer
        answer = self.generator.generate(prompt)

        # Step 5: Enforce refusal rule
        if answer.strip() == REFUSAL_RESPONSE:
            return {
                "answer": f"{REFUSAL_RESPONSE} (Debug: LLM refused. Retrieved {len(docs)} docs. First chunk: {docs[0].page_content[:50]}...)",
                "citations": []
            }

        # Step 6: Build citations from metadata
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
