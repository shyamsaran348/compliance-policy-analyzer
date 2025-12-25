/**
* Base configuration for API requests.
* Typically, the base URL would come from VITE_API_URL env var.
* hardcoded to localhost:8000 for this phase as per instructions.
*/

export const API_BASE_URL = 'http://localhost:8000/api/v1';

// In a real app, this might come from a secure storage or env if it's a public client key.
// As per instructions, we expect the user to provide this or we use a dev key.
// Ideally, the user enters this in the UI, or we load it from .env.
// For now, we will create a helper to get headers.

export const getHeaders = (apiKey: string): HeadersInit => {
    return {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
    };
};
