# backend/app/rag/generator.py

from groq import Groq
from app.core.config import settings

class LLMGenerator:
    """
    LLM Generator using Groq + LLaMA 3 (8B).
    
    Refactored for Lazy Initialization to prevent Vercel startup crashes if keys are missing.
    """

    def __init__(self):
        self.model_name = "llama-3.1-8b-instant"
        self._client = None

    @property
    def client(self):
        if self._client is None:
            if not settings.GROQ_API_KEY:
                # We do NOT raise here, because this might be accessed at startup.
                # We return None and handle it in generate()
                return None
            self._client = Groq(api_key=settings.GROQ_API_KEY)
        return self._client

    def generate(self, prompt: str) -> str:
        """
        Generate an answer from the LLM using a grounded prompt.
        """
        if not self.client:
            return "Configuration Error: GROQ_API_KEY is unset. Please add it to Vercel Environment Variables."

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.0,
                max_tokens=512
            )
            answer = response.choices[0].message.content.strip()
            
            if not answer:
                return "Answer not found in the provided documents."

            return answer

        except Exception as e:
            print(f"LLM Generation Error: {e}")
            return f"Error contacting LLM Provider: {str(e)}"
