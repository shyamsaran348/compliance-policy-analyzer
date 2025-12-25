/**
 * TypeScript definitions mirroring Backend Pydantic schemas.
 * Ensure strict synchronization with backend/app/models/
 */

export interface ChatRequest {
  question: string;
  workspace_id: string; // Mandatory for V2
}

export interface CreateWorkspaceRequest {
  name: string;
  document_ids: string[];
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  status: 'processing' | 'available' | 'error';
  page_count: number;
  upload_timestamp: string;
}

export interface Workspace {
  id: string;
  name: string;
  document_ids: string[];
  created_at: string;
}

export interface Citation {
  doc_name: string;
  page_number: number;
  snippet: string;
  score?: number;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  error?: string;
}

// For SSE Streaming, we might receive partial chunks or a final event.
// This interface represents the structure of the data payload in the SSE event.
export interface StreamEvent {
  content?: string; // Partial token
  citations?: Citation[]; // Arrives at the end
  error?: string;
  done?: boolean; // Signal completion
}
