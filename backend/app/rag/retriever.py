from langchain_pinecone import PineconeVectorStore
from app.rag.embeddings import get_embedding_model
from typing import List, Dict, Optional
from langchain_core.documents import Document
from app.core.config import settings

class PolicyRetriever:
    """
    Handles similarity-based retrieval from Pinecone.
    """

    def __init__(self, k: int = 5):
        self.k = k
        self.index_name = settings.PINECONE_INDEX_NAME
        
        embedding_model = get_embedding_model()

        self.vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=embedding_model.embedder,
            pinecone_api_key=settings.PINECONE_API_KEY
        )

    def retrieve(self, query: str, filter: Optional[Dict] = None) -> List[Document]:
        """
        Retrieve top-K relevant chunks for a query.
        
        Args:
            query: The user's question.
            filter: Metadata filter dict (e.g. {"doc_name": {"$in": [...]}})
        """
        results = self.vectorstore.similarity_search(
            query=query,
            k=self.k,
            filter=filter
        )
        return results
