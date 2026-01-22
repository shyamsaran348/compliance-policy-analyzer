from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.workspaces import router as workspaces_router
from app.core.config import settings
from pinecone import Pinecone, ServerlessSpec
import time
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure Pinecone Index Exists
    if settings.PINECONE_API_KEY:
        try:
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            index_name = settings.PINECONE_INDEX_NAME
            existing_indexes = [i.name for i in pc.list_indexes()]
            
            if index_name not in existing_indexes:
                print(f"⚠️ Index '{index_name}' not found. Creating it automatically...")
                pc.create_index(
                    name=index_name,
                    dimension=384, # MiniLM-L6-v2
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                print(f"✅ Index '{index_name}' created. Waiting for readiness...")
                while not pc.describe_index(index_name).status['ready']:
                    time.sleep(1)
                print("✅ Index is ready.")
            else:
                print(f"✅ Pinecone Index '{index_name}' found.")
        except Exception as e:
            print(f"⚠️ Warning: Failed to initialize Pinecone on startup: {e}")
    
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Compliance & Policy Analyzer API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False, # Changed to False because Vercel/wildcard might have issues with True, but * is fine for now
    allow_methods=["*"],
    allow_headers=["*", "x-api-key"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Register API routes
app.include_router(chat_router)
app.include_router(documents_router, prefix="/api/v1")
app.include_router(workspaces_router, prefix="/api/v1")
