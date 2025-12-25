from langchain_community.vectorstores import Chroma
from app.rag.embeddings import get_embedding_model
from typing import List
from langchain_core.documents import Document
import os


from pathlib import Path

class PolicyRetriever:
    """
    Handles similarity-based retrieval from ChromaDB.
    """

    def __init__(self, collection_name: str, k: int = 7, persist_dir: str = None):
        self.k = k
        # Resolve 'storage/chroma' reliably using __file__
        # retriever.py is in backend/app/rag -> parents[3] is project root
        base_dir = Path(__file__).resolve().parents[3]
        default_dir = base_dir / "storage" / "chroma"
        
        self.persist_dir = persist_dir or str(default_dir)
        self.collection_name = collection_name

        if not os.path.exists(self.persist_dir):
            raise FileNotFoundError(
                f"ChromaDB directory not found at {self.persist_dir}. Run ingestion first."
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
