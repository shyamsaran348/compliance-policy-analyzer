from typing import List
from huggingface_hub import InferenceClient
from app.core.config import settings
import time
import requests

class EmbeddingModel:
    """
    Centralized embedding model for the entire RAG system.
    Uses huggingface_hub InferenceClient for robust API handling.
    """

    def __init__(self):
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        
        if not settings.HUGGINGFACEHUB_API_TOKEN:
            print("⚠️ WARNING: HUGGINGFACEHUB_API_TOKEN not set. Embeddings will fail.")
            self.client = None
        else:
            self.client = InferenceClient(token=settings.HUGGINGFACEHUB_API_TOKEN)

    def _generate(self, texts: List[str]) -> List[List[float]]:
        if not self.client:
             raise ValueError("HuggingFace Token is missing.")

        for attempt in range(3):
            try:
                # feature_extraction returns ndarray or list depending on usage
                # We force it to list for consistency
                response = self.client.feature_extraction(texts, model=self.model_name)
                # Parse response: it behaves differently for single vs list
                # But widely it returns a list of embeddings
                import numpy as np
                if isinstance(response, np.ndarray):
                    return response.tolist()
                return response
            except Exception as e:
                print(f"InferenceClient Error (Attempt {attempt+1}): {e}")
                
                # Check for 503 loading
                if "503" in str(e) or "Model is loading" in str(e):
                    time.sleep(3)
                    continue
                
                if attempt == 2:
                    raise ValueError(f"HF Inference Failed: {e}")
                time.sleep(1)
        
        return []

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._generate(texts)

    def embed_query(self, query: str) -> List[float]:
        # Returns a single vector
        # Note: feature_extraction on a list of 1 string usually returns [ [float...] ]
        # feature_extraction on a raw string returns [float...] or [ [float...] ] depending on version
        # Safest is to pass a list
        result = self._generate([query])
        if result and len(result) > 0:
            return result[0]
        return []

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
