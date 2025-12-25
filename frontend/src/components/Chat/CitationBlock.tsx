import React, { useState } from 'react';
import type { Citation } from '../../types/api';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
// We'll use inline styles for speed/simplicity given the "Vanilla CSS" constraint, 
// strictly mapped to our tokens.

interface CitationBlockProps {
    citations: Citation[];
}

const CitationItem: React.FC<{ citation: Citation }> = ({ citation }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            padding: 'var(--space-2)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease-in-out'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-1)',
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                fontWeight: 500
            }}>
                <span title={citation.doc_name} style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '70%'
                }}>
                    {citation.doc_name}
                </span>
                <span>Page {citation.page_number}</span>
            </div>

            <div
                onClick={() => setExpanded(!expanded)}
                style={{ cursor: 'pointer' }}
                title={expanded ? "Click to collapse" : "Click to expand"}
            >
                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    // Clamping logic
                    display: '-webkit-box',
                    WebkitLineClamp: expanded ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap'
                }}>
                    "{citation.snippet.trim()}"
                </p>
                <div style={{
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: 0.8
                }}>
                    {expanded ? (
                        <><ChevronUp size={12} /> Show less</>
                    ) : (
                        <><ChevronDown size={12} /> Show more</>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CitationBlock: React.FC<CitationBlockProps> = ({ citations }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!citations || citations.length === 0) return null;

    return (
        <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'transparent', // Removed heavy bg
            borderRadius: 'var(--radius-md)',
            borderTop: '1px solid var(--border-subtle)', // Only top border for separation
            fontSize: '0.9rem'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    width: '100%',
                    color: 'var(--text-tertiary)', // Lighter color for header
                    fontWeight: 600,
                    marginBottom: isOpen ? 'var(--space-3)' : 0,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}
            >
                <BookOpen size={14} />
                <span>Sources ({citations.length})</span>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {citations.map((cit, idx) => (
                        <CitationItem key={idx} citation={cit} />
                    ))}
                </div>
            )}
        </div>
    );
};
