from langchain_huggingface import HuggingFaceEndpointEmbeddings
from typing import List
from app.core.config import settings
import os

class EmbeddingModel:
    """
    Centralized embedding model for the entire RAG system.
    Uses HuggingFace Inference API to avoid heavy local models.
    """

    def __init__(self):
        # Using a solid general purpose model that is usually free on HF Inference API
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        
        if not settings.HUGGINGFACEHUB_API_TOKEN:
            print("⚠️ WARNING: HUGGINGFACEHUB_API_TOKEN not set. Embeddings will fail.")

        self.embedder = HuggingFaceEndpointEmbeddings(
            model=self.model_name,
            huggingfacehub_api_token=settings.HUGGINGFACEHUB_API_TOKEN,
            task="feature-extraction"
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embedder.embed_documents(texts)

    def embed_query(self, query: str) -> List[float]:
        return self.embedder.embed_query(query)


# Singleton-style accessor
_embedding_model = None

def get_embedding_model() -> EmbeddingModel:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    return _embedding_model
