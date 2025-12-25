from langchain_community.vectorstores import Chroma
from app.rag.embeddings import get_embedding_model
from typing import List
from langchain_core.documents import Document
import os


class PolicyRetriever:
    """
    Handles similarity-based retrieval from ChromaDB.
    """

    def __init__(self, k: int = 7):
        self.k = k
        self.persist_dir = "backend/data/chroma"
        self.collection_name = "policy_docs"

        if not os.path.exists(self.persist_dir):
            raise FileNotFoundError(
                "ChromaDB directory not found. Run ingestion first."
            )

        embedding_model = get_embedding_model()

        self.vectorstore = Chroma(
            persist_directory=self.persist_dir,
            embedding_function=embedding_model.embedder,
            collection_name=self.collection_name
        )

    def retrieve(self, query: str) -> List[Document]:
        """
        Retrieve top-K relevant chunks for a query.
        """
        results = self.vectorstore.similarity_search(
            query=query,
            k=self.k
        )
        return results
