# Deployment Guide 🚀 (Serverless Edition)

I have successfully refactored the application to be **Vercel Serverless Compatible**.
Instead of storing files on disk (which fails on Vercel), it now uses **Pinecone (Vector DB)** and **HuggingFace (Embeddings)** in the cloud.

---

## 🔑 Prerequisites (Get these first!)

1.  **Pinecone API Key**:
    *   Sign up at [pinecone.io](https://pinecone.io) (Free Starter Tier).
    *   Create an Index named `compliance-policy` (Dimension: **384**, Metric: **Cosine**).
    *   Copy your API Key.
2.  **HuggingFace Token**:
    *   Sign up at [huggingface.co](https://huggingface.co).
    *   Go to Settings -> Access Tokens -> Create New (Type: Read).
    *   Copy the Token (`hf_...`).
3.  **Groq API Key**:
    *   (You should already have this).

---

## 🚀 Deployment Strategy

Since this is a Monorepo (Backend + Frontend in one folder), the easiest way to "hack" it onto Vercel is to deploy them as **two separate Vercel projects** linked to the same GitHub repo, but with different Root Directories.

### Project 1: The Backend (Deploy This First)

1.  Push your code to GitHub.
2.  Go to Vercel -> **Add New Project**.
3.  Select your Repository.
4.  **Project Name**: `policy-backend` (or similar).
5.  **Root Directory**: Click Edit -> Select `backend`.
6.  **Framework Preset**: Select `Other` (or generic Python if available, but "Other" is fine as we have `vercel.json`).
7.  **Environment Variables** (Add these!):
    *   `API_KEY`: (Generate a random string)
    *   `GROQ_API_KEY`: (Your Groq Key)
    *   `PINECONE_API_KEY`: (Your Pinecone Key)
    *   `PINECONE_INDEX_NAME`: `compliance-policy`
    *   `HUGGINGFACEHUB_API_TOKEN`: (Your HF Token)
8.  **Deploy**.
9.  Once deployed, copy the **Domain** (e.g., `https://policy-backend.vercel.app`).

### Project 2: The Frontend

1.  Go to Vercel -> **Add New Project**.
2.  Select the **SAME** Repository.
3.  **Project Name**: `policy-frontend`.
4.  **Root Directory**: Click Edit -> Select `frontend`.
5.  **Framework Preset**: `Vite` (should auto-detect).
6.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: Paste the Backend URL from Step 1 (e.g., `https://policy-backend.vercel.app/api/v1`).
    *   *Note*: Ensure you add `/api/v1` to the end.
7.  **Deploy**.

---

## ⚠️ Important Limitations of "Serverless" Mode

1.  **Data Persistence**:
    *   **Files**: PDFs are NOT saved. If you upload a PDF, it is processed into Pinecone and then forgotten. You cannot "download" the original PDF later.
    *   **Workspaces**: Workspace definitions (names) are stored in **Memory**. This means if the server sleeps (cold boot), **Workspace Names will vanish**.
    *   *Workaround*: The vectors are safe in Pinecone! You just might lose the "folder" organization on the frontend after a restart. For a demo, this is fine. For production, you would need a small Postgres DB (Supabase) to store the workspace metadata.

2.  **Cold Starts**: The first request might take 5-10 seconds while the Python function wakes up.

