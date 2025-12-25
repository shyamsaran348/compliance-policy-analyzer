from langchain_community.embeddings import HuggingFaceEmbeddings
from typing import List


class EmbeddingModel:
    """
    Centralized embedding model for the entire RAG system.

    This ensures:
    - Same model is used for documents and queries
    - Deterministic vector generation
    - Easy replacement if needed (without touching retrieval logic)
    """

    def __init__(self):
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.embedder = HuggingFaceEmbeddings(
            model_name=self.model_name
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of document chunks.

        Args:
            texts: List of chunk texts

        Returns:
            List of embedding vectors
        """
        return self.embedder.embed_documents(texts)

    def embed_query(self, query: str) -> List[float]:
        """
        Embed a user query.

        Args:
            query: User question

        Returns:
            Query embedding vector
        """
        return self.embedder.embed_query(query)


# Singleton-style accessor (recommended)
_embedding_model = None


def get_embedding_model() -> EmbeddingModel:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    return _embedding_model
