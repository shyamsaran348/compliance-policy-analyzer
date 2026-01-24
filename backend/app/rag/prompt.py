# backend/app/rag/prompt.py

from typing import List
from langchain_core.documents import Document


SYSTEM_RULES = """
You are a compliance policy assistant.

You must answer the user's question using the information provided in the context below.

RULES:
- You MAY use the provided text to infer answers if they are logically supported.
- Do NOT use external training data to add facts not mentioned in the context.
- If the answer definitively cannot be found or inferred from the context, respond with:

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
