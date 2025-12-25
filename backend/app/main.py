from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.workspaces import router as workspaces_router

app = FastAPI(
    title="Compliance & Policy Analyzer API",
    version="1.0.0"
)

# CORS Configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
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
