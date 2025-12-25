import { useState, useRef, useCallback } from 'react';
import { API_BASE_URL, getHeaders } from '../api/client';
import type { Citation } from '../types/api';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    citations?: Citation[];
    isStreaming?: boolean;
}

interface UseChatReturn {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string, apiKey: string) => Promise<void>;
    clearChat: () => void;
}

export const useChat = (): UseChatReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    const sendMessage = useCallback(async (text: string, apiKey: string) => {
        if (!text.trim()) return;

        // reset error
        setError(null);
        setIsLoading(true);

        // Create user message
        const userMsgId = crypto.randomUUID();
        const userMessage: Message = { id: userMsgId, role: 'user', text };

        // Create placeholder assistant message
        const botMsgId = crypto.randomUUID();
        const botMessage: Message = {
            id: botMsgId,
            role: 'assistant',
            text: '',
            isStreaming: true
        };

        setMessages((prev) => [...prev, userMessage, botMessage]);

        // Setup AbortController
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: getHeaders(apiKey),
                body: JSON.stringify({ question: text }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Invalid API Key");
                if (response.status === 400) throw new Error("Bad Request (Check inputs)");
                if (response.status === 422) throw new Error("Validation Error (Check inputs)");
                if (response.status === 429) throw new Error("Rate limit exceeded. Please wait.");
                throw new Error(`Server Error: ${response.statusText}`);
            }

            // Backend returns standard JSON, not SSE
            // { answer: string, citations: Citation[] }
            const data = await response.json();

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMsgId
                        ? { ...msg, text: data.answer || "No answer returned.", citations: data.citations || [] }
                        : msg
                )
            );

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Request aborted');
                return;
            }
            setError(err.message || 'Something went wrong');
            // If error, remove the bot bubble or show error in it? 
            // For now, let's update the bot bubble text to indicate error was encountered if empty
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMsgId && !msg.text
                        ? { ...msg, text: "Error: Could not retrieve answer." }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMsgId
                        ? { ...msg, isStreaming: false }
                        : msg
                )
            );
        }
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat
    };
};
