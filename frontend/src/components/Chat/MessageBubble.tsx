import type { Message } from '../../hooks/useChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CitationBlock } from './CitationBlock';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MessageBubbleProps {
    message: Message;
    animate?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, animate = false }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    // Typewriter State
    const [displayedText, setDisplayedText] = useState(animate && !isUser ? '' : message.text);
    const [isTyping, setIsTyping] = useState(animate && !isUser);

    useEffect(() => {
        if (!animate || isUser) {
            setDisplayedText(message.text);
            setIsTyping(false);
            return;
        }

        let currentIndex = 0;
        const speed = 15; // ms per char (adjust for feel)

        const intervalId = setInterval(() => {
            if (currentIndex < message.text.length) {
                setDisplayedText(message.text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [message.text, animate, isUser]);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            margin: 'var(--space-6) 0',
            maxWidth: '85%',
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            width: '100%'
        }}>

            {/* Header / Icon */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-2)',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                color: 'var(--text-tertiary)',
                fontSize: '0.85rem'
            }}>
                <div style={{
                    width: 28, height: 28,
                    borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isUser ? 'var(--color-primary-light)' : 'var(--bg-surface-hover)',
                    color: isUser ? 'var(--color-primary)' : 'var(--text-secondary)'
                }}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <span style={{ fontWeight: 600 }}>{isUser ? 'You' : 'Compliance Assistant'}</span>

                {/* Copy Button (Only show when not typing) */}
                {!isUser && !isTyping && (
                    <button
                        onClick={handleCopy}
                        style={{
                            marginLeft: 'auto',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.75rem'
                        }}
                    >
                        {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                        {copied && <span style={{ color: 'var(--color-success)' }}>Copied</span>}
                    </button>
                )}
            </div>

            {/* Bubble Content */}
            <div style={{
                backgroundColor: isUser ? 'var(--color-primary)' : 'var(--bg-surface)',
                color: isUser ? 'var(--text-inverse)' : 'var(--text-primary)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                borderTopLeftRadius: isUser ? 'var(--radius-lg)' : 0,
                borderTopRightRadius: isUser ? 0 : 'var(--radius-lg)',
                boxShadow: isUser ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                lineHeight: 1.6,
                fontSize: '1rem',
                maxWidth: '100%',
                overflowWrap: 'break-word',
                transition: 'background-color 0.3s'
            }}>
                {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
                ) : (
                    <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayedText}
                        </ReactMarkdown>
                    </div>
                )}

                {/* Blinking Cursor for Streaming */}
                {message.isStreaming && (
                    <span className="blinking-cursor" style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '16px',
                        backgroundColor: 'currentColor',
                        marginLeft: '4px',
                        verticalAlign: 'middle',
                        opacity: 0.7
                    }} />
                )}
            </div>

            {/* Citations (Only for Assistant) */}
            {!isUser && message.citations && message.citations.length > 0 && (
                <div style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                    <CitationBlock citations={message.citations} />
                </div>
            )}

            {/* Markdown Styles */}
            <style>{`
            .markdown-content p {
                margin-bottom: 0.75rem;
            }
            .markdown-content p:last-child {
                margin-bottom: 0;
            }
            .markdown-content ul, .markdown-content ol {
                margin-left: 1.5rem;
                margin-bottom: 0.75rem;
            }
            .markdown-content li {
                margin-bottom: 0.25rem
            }
            .markdown-content strong {
                font-weight: 600;
                color: var(--color-primary);
            }
            .markdown-content code {
                background-color: var(--bg-surface-hover);
                padding: 0.2rem 0.4rem;
                border-radius: var(--radius-sm);
                font-family: var(--font-mono);
                font-size: 0.85em;
                color: var(--color-primary);
            }
            .markdown-content pre {
                background-color: #1e1e1e;
                color: #d4d4d4;
                padding: 1rem;
                border-radius: var(--radius-md);
                overflow-x: auto;
                margin-bottom: 1rem;
            }
            .markdown-content pre code {
                background-color: transparent;
                color: inherit;
                padding: 0;
            }
            `}</style>
        </div>
    );
};
