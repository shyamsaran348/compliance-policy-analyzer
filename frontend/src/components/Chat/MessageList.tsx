import React, { useEffect, useRef } from 'react';
import type { Message } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ThinkingBubble } from './ThinkingBubble';
import { ShieldCheck } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    onExampleClick: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onExampleClick }) => {
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
                opacity: 0.9,
                padding: 'var(--space-6)'
            }}>
                <div style={{
                    width: '64px', height: '64px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <ShieldCheck size={32} color="var(--color-primary)" />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                    Compliance Analyzer
                </h2>
                <p style={{ maxWidth: '400px', textAlign: 'center', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                    Ask questions about GDPR and other compliance documents.
                    Answers are strictly grounded in the provided source text.
                </p>

                {/* Example Chips */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                    {[
                        "Summarize the Data Retention Policy",
                        "What are the reporting requirements?",
                        "How is sensitive data protected?",
                        "List all compliance obligations"
                    ].map((text, idx) => (
                        <button
                            key={idx}
                            onClick={() => onExampleClick(text)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-full)',
                                color: 'var(--color-primary)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                                e.currentTarget.style.color = 'var(--color-primary)';
                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}
                        >
                            {text}
                        </button>
                    ))}
                </div>
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
            {messages.map((msg, index) => (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    animate={index === messages.length - 1 && msg.role !== 'user'}
                />
            ))}

            {isLoading && <ThinkingBubble />}

            <div ref={bottomRef} style={{ height: '1px' }} />
        </div>
    );
};
