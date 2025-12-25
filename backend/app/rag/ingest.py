# backend/app/rag/ingest.py

from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from app.rag.embeddings import get_embedding_model
import os


# Resolve backend root
BASE_DIR = Path(__file__).resolve().parents[2]
DOCUMENTS_DIR = BASE_DIR / "data" / "documents"


def load_pdf_pages(pdf_name: str):
    """
    Load a PDF and return raw page-level Documents.
    """
    pdf_path = DOCUMENTS_DIR / pdf_name

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found at path: {pdf_path}")

    loader = PyPDFLoader(str(pdf_path))
    return loader.load()


def normalize_pages(raw_pages, doc_name: str):
    """
    Normalize raw PDF pages into clean Documents
    with controlled metadata.
    """
    normalized_docs = []

    for page in raw_pages:
        page_number = page.metadata.get("page", 0) + 1

        normalized_docs.append(
            Document(
                page_content=page.page_content,
                metadata={
                    "doc_name": doc_name,
                    "page_number": page_number,
                }
            )
        )

    return normalized_docs


def chunk_pages(pages):
    """
    Split pages into overlapping semantic chunks
    while preserving metadata and assigning chunk_id.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )

    chunked_docs = []

    for page in pages:
        splits = splitter.split_text(page.page_content)

        for idx, chunk in enumerate(splits):
            chunked_docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "doc_name": page.metadata["doc_name"],
                        "page_number": page.metadata["page_number"],
                        "chunk_id": f"{page.metadata['doc_name']}_p{page.metadata['page_number']}_c{idx + 1}"
                    }
                )
            )

    return chunked_docs

def validate_chunks(chunks):
    """
    Run sanity checks on ingested chunks.
    """
    assert len(chunks) > 0, "No chunks created"

    seen_chunk_ids = set()

    for chunk in chunks:
        # Content validation
        assert chunk.page_content.strip(), "Empty chunk content"

        # Metadata validation
        metadata = chunk.metadata
        assert "doc_name" in metadata, "Missing doc_name"
        assert "page_number" in metadata, "Missing page_number"
        assert "chunk_id" in metadata, "Missing chunk_id"

        # Uniqueness check
        assert metadata["chunk_id"] not in seen_chunk_ids, "Duplicate chunk_id detected"
        seen_chunk_ids.add(metadata["chunk_id"])

    print("✅ Ingestion validation passed")

def index_chunks(chunks):
    """
    Stores validated chunks into ChromaDB with embeddings and metadata.
    """
    persist_dir = "backend/data/chroma"
    os.makedirs(persist_dir, exist_ok=True)

    embedding_model = get_embedding_model()

    texts = [chunk.page_content for chunk in chunks]
    metadatas = [chunk.metadata for chunk in chunks]
    ids = [chunk.metadata["chunk_id"] for chunk in chunks]

    vectorstore = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        ids=ids,
        embedding=embedding_model.embedder,
        persist_directory=persist_dir,
        collection_name="policy_docs"
    )

    vectorstore.persist()

    print(f"✅ Stored {len(texts)} chunks in ChromaDB")


    



if __name__ == "__main__":
    raw_pages = load_pdf_pages("gdpr.pdf")
    pages = normalize_pages(raw_pages, "gdpr.pdf")
    chunks = chunk_pages(pages)

    validate_chunks(chunks)

    print(f"Total pages: {len(pages)}")
    print(f"Total chunks: {len(chunks)}")
    print("Sample validated chunk metadata:")
    print(chunks[0].metadata)

    index_chunks(chunks)
