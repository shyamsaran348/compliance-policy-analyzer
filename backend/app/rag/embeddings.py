from typing import List
import requests
from app.core.config import settings
import time

class EmbeddingModel:
    """
    Centralized embedding model for the entire RAG system.
    Uses Direct API Calls to HuggingFace Inference to avoid heavy local libraries.
    """

    def __init__(self):
        # Using a solid general purpose model
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}"
        
        if not settings.HUGGINGFACEHUB_API_TOKEN:
            print("⚠️ WARNING: HUGGINGFACEHUB_API_TOKEN not set. Embeddings will fail.")
            self.headers = {}
        else:
            self.headers = {"Authorization": f"Bearer {settings.HUGGINGFACEHUB_API_TOKEN}"}

    def _call_api(self, texts: List[str]) -> List[List[float]]:
        """
        Helper to call HF API with retry logic.
        """
        payload = {
            "inputs": texts,
            "options": {"wait_for_model": True}
        }
        
        for attempt in range(3):
            try:
                response = requests.post(self.api_url, headers=self.headers, json=payload)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Embedding API Error (Attempt {attempt+1}): {e}")
                # Try to extract detailed error if possible
                error_detail = str(e)
                if isinstance(e, requests.exceptions.HTTPError):
                     if e.response.status_code == 503:
                        time.sleep(2)
                        continue
                     try:
                        error_detail = str(e.response.json())
                     except:
                        pass
                
                if attempt == 2: # Last attempt
                    raise ValueError(f"HF API Failed: {error_detail}")
                
                time.sleep(1)
        
        raise ValueError("Failed to generate embeddings via HuggingFace API (Unknown Error)")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # HF API has limits on batch size, splitting if necessary could be good
        # But for this demo, we assume chunks are reasonable.
        return self._call_api(texts)

    def embed_query(self, query: str) -> List[float]:
        # Returns a single vector
        result = self._call_api([query])
        if isinstance(result, list) and len(result) > 0:
             # The API returns [ [float, float...] ] for a single input
            return result[0] 
        return []

    # LangChain compatibility property
    @property
    def embedder(self):
        return self

# Singleton-style accessor
_embedding_model = None

def get_embedding_model() -> EmbeddingModel:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    return _embedding_model
