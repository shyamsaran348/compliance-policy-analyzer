import React, { useEffect, useRef } from 'react';
import type { Message } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ThinkingBubble } from './ThinkingBubble';
import { ShieldCheck } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    if (messages.length === 0 && !isLoading) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                opacity: 0.8
            }}>
                <div style={{
                    width: '64px', height: '64px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <ShieldCheck size={32} color="var(--color-primary)" />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                    Compliance Analyzer
                </h2>
                <p style={{ maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
                    Ask questions about GDPR and other compliance documents.
                    Answers are strictly grounded in the provided source text.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            scrollBehavior: 'smooth'
        }}>
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && <ThinkingBubble />}

            <div ref={bottomRef} style={{ height: '1px' }} />
        </div>
    );
};
