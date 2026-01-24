# backend/app/rag/ingest.py

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from app.rag.embeddings import get_embedding_model
from app.core.config import settings
from pinecone import Pinecone, ServerlessSpec
import time

def process_and_index_document(text_content: str, filename: str):
    """
    Takes raw text from a PDF (extracted in service layer) 
    and indexes it into Pinecone.
    """
    
    # 1. Create Document Object
    doc = Document(
        page_content=text_content,
        metadata={"doc_name": filename}
    )

    # 2. Chunking
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents([doc])

    # 3. Add Chunk Metadata
    for idx, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = f"{filename}_c{idx}"
        chunk.metadata["text"] = chunk.page_content # Explicitly store text for retrieval if needed

    print(f"Split {filename} into {len(chunks)} chunks.")

    # 4. Index to Pinecone
    index_chunks(chunks)

    return len(chunks)

def index_chunks(chunks):
    """
    Stores validated chunks into Pinecone.
    """
    if not settings.PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY is missing via env vars")

    embedding_model = get_embedding_model()

    # Initialize Pinecone
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    
    index_name = settings.PINECONE_INDEX_NAME

    # Store
    # Serverless Optimization: Assume index exists to avoid timeouts.
    try:
        vectorstore = PineconeVectorStore.from_documents(
            documents=chunks,
            embedding=embedding_model.embedder,
            index_name=index_name
        )
        print(f"✅ Stored {len(chunks)} chunks in Pinecone index: {index_name}")
    except Exception as e:
        print(f"❌ Failed to store in Pinecone: {e}")
        raise e
