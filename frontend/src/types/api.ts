/**
 * TypeScript definitions mirroring Backend Pydantic schemas.
 * Ensure strict synchronization with backend/app/models/schemas.py
 */

export interface ChatRequest {
  question: string;
  stream?: boolean; // Default is true in logic, but optional in type
}

export interface Citation {
  doc_name: string;
  page_number: number;
  snippet: string;
  score?: number; // Optional, sometimes returned by retrievers
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  error?: string; // For handling refusals or backend errors gracefully
}

// For SSE Streaming, we might receive partial chunks or a final event.
// This interface represents the structure of the data payload in the SSE event.
export interface StreamEvent {
  content?: string; // Partial token
  citations?: Citation[]; // Arrives at the end
  error?: string;
  done?: boolean; // Signal completion
}
