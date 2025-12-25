import React, { useState, type KeyboardEvent } from 'react';
import { Send, Key } from 'lucide-react';

interface InputAreaProps {
    onSend: (text: string, apiKey: string) => void;
    isLoading: boolean;
    messagesCount: number;
    disabled?: boolean;
    disabledPlaceholder?: string;
}

export const InputArea: React.FC<InputAreaProps> = ({
    onSend,
    isLoading,
    messagesCount,
    disabled = false,
    disabledPlaceholder = "Ask about compliance policies..."
}) => {
    const [text, setText] = useState('');
    const [apiKey, setApiKey] = useState(''); // In a real app, manage this better
    const [showKeyInput, setShowKeyInput] = useState(false);

    const handleSend = () => {
        if (disabled) return;
        if (!text.trim() || !apiKey.trim()) {
            if (!apiKey.trim()) setShowKeyInput(true);
            return;
        }
        onSend(text, apiKey);
        setText('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ... existing suggestions ...

    // ... inside the textarea style ...
    <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? disabledPlaceholder : "Ask about compliance policies..."}
        style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            minHeight: '24px',
            maxHeight: '200px',
            padding: 'var(--space-2)',
            fontSize: '1rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            backgroundColor: 'transparent',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text'
        }}
        disabled={isLoading || disabled}
        rows={1}
    />

    const suggestions = [
        "What is Article 15?",
        "Rights of data subject?",
        "What is personal data?"
    ];

    const handleClear = () => {
        if (confirm("Clear all messages?")) {
            window.location.reload(); // Simple cheat for clearing state without prop drilling
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative',
            padding: 'var(--space-4)'
        }}>

            {/* Suggestions Chips */}
            {messagesCount === 0 && (
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-4)',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            onClick={() => setText(s)}
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.85rem',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="hover-chip"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* API Key & Clear Chat Controls */}
            <div style={{
                position: 'absolute',
                top: messagesCount === 0 ? '-80px' : '-40px', // Adjust based on chips
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <button
                    onClick={handleClear}
                    style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textDecoration: 'underline' }}
                >
                    Clear Chat
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {showKeyInput && (
                        <input
                            type="password"
                            placeholder="Enter API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '0.85rem'
                            }}
                        />
                    )}
                    <button
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        style={{
                            color: apiKey ? 'var(--color-success)' : 'var(--text-tertiary)',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                        title="API Key Configuration"
                    >
                        <Key size={16} />
                        <span style={{ fontSize: '0.8rem' }}>{apiKey ? 'Key Set' : 'Set Key'}</span>
                    </button>
                </div>
            </div>

            <div style={{
                position: 'relative',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                padding: 'var(--space-3)',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 'var(--space-2)'
            }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about compliance policies..."
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        minHeight: '24px',
                        maxHeight: '200px',
                        padding: 'var(--space-2)',
                        fontSize: '1rem',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent'
                    }}
                    disabled={isLoading}
                    rows={1}
                />

                <button
                    onClick={handleSend}
                    disabled={isLoading || !text.trim()}
                    style={{
                        backgroundColor: !text.trim() || isLoading ? 'var(--bg-surface-hover)' : 'var(--color-primary)',
                        color: !text.trim() || isLoading ? 'var(--text-tertiary)' : 'var(--text-inverse)',
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-fast)'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-3)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)'
            }}>
                RAG-Powered • Groq LLaMA 3.1 • Grounded in Official Documents
            </div>

            <style>{`
              .hover-chip:hover {
                 background-color: var(--color-primary-light) !important;
                 border-color: var(--color-primary) !important;
              }
            `}</style>
        </div>
    );
};
