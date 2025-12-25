# backend/app/rag/generator.py

import os
from groq import Groq


class LLMGenerator:
    """
    LLM Generator using Groq + LLaMA 3 (8B).

    This class is responsible ONLY for:
    - Sending a grounded prompt to the LLM
    - Returning raw text output
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set in environment variables")

        self.client = Groq(api_key=api_key)

        # Locked model
        self.model_name = "llama-3.1-8b-instant"

    def generate(self, prompt: str) -> str:
        """
        Generate an answer from the LLM using a grounded prompt.

        Args:
            prompt (str): Fully constructed grounded prompt

        Returns:
            str: Model-generated answer (plain text)
        """

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.0,  # Deterministic output
            max_tokens=512
        )

        answer = response.choices[0].message.content.strip()

        # Absolute safety net (defensive)
        if not answer:
            return "Answer not found in the provided documents."

        return answer
