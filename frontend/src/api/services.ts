import { API_BASE_URL, getHeaders } from './client';
import type { DocumentMetadata, Workspace, CreateWorkspaceRequest } from '../types/api';

export const documentService = {
    async listDocuments(apiKey: string): Promise<DocumentMetadata[]> {
        const response = await fetch(`${API_BASE_URL}/documents/`, {
            headers: getHeaders(apiKey)
        });
        if (!response.ok) throw new Error('Failed to fetch documents');
        return response.json();
    },

    async uploadDocument(file: File, apiKey: string): Promise<DocumentMetadata> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                // Content-Type is set automatically by browser for FormData
            },
            body: formData
        });

        if (!response.ok) {
            let errorMsg = 'Upload failed';
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.message || 'Upload failed';
            } catch (e) {
                console.error("Failed to parse error response", e);
            }
            throw new Error(errorMsg);
        }
        return response.json();
    }
};

export const workspaceService = {
    async createWorkspace(req: CreateWorkspaceRequest, apiKey: string): Promise<Workspace> {
        const response = await fetch(`${API_BASE_URL}/workspaces/`, {
            method: 'POST',
            headers: getHeaders(apiKey),
            body: JSON.stringify(req)
        });
        if (!response.ok) throw new Error('Failed to create workspace');
        return response.json();
    }
};
