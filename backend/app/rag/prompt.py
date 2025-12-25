# backend/app/rag/prompt.py

from typing import List
from langchain_core.documents import Document


SYSTEM_RULES = """
You are a compliance policy assistant.

You must answer the user's question using ONLY the information provided
in the context below.

STRICT RULES:
- Do NOT use any external knowledge.
- Do NOT use prior training data.
- Do NOT guess, infer, or assume.
- Do NOT add explanations outside the provided text.
- If the answer is NOT explicitly present in the context,
  respond with EXACTLY the following sentence and nothing else:

Answer not found in the provided documents.
""".strip()


def build_prompt(question: str, documents: List[Document]) -> str:
    """
    Build a strictly grounded prompt for RAG-based generation.

    Args:
        question (str): User question
        documents (List[Document]): Retrieved documents (LangChain Document objects)

    Returns:
        str: Final prompt string
    """

    if not documents:
        # No context at all → force refusal
        return f"""{SYSTEM_RULES}

Context:
(No relevant context provided)

Question:
{question}
"""

    context_blocks = []
    for doc in documents:
        context_blocks.append(doc.page_content.strip())

    context_text = "\n\n".join(context_blocks)

    prompt = f"""{SYSTEM_RULES}

Context:
{context_text}

Question:
{question}
"""

    return prompt
