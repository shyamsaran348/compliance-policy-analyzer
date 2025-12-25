import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import type { DocumentMetadata } from '../../types/api';

interface WorkspaceHeaderProps {
    selectedDocuments: DocumentMetadata[];
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ selectedDocuments }) => {
    const hasSelection = selectedDocuments.length > 0;

    return (
        <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px', // Fixed height
            flexShrink: 0
        }}>
            {/* Left: Active Scope */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {hasSelection ? (
                    <>
                        <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.05em'
                        }}>
                            Active Scope:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {selectedDocuments.map(doc => (
                                <div key={doc.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    backgroundColor: 'var(--bg-surface-hover)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)'
                                }}>
                                    <FileText size={12} />
                                    <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.filename}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        color: 'var(--color-warning)',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        <AlertTriangle size={16} />
                        <span>No documents selected. Chat is disabled.</span>
                    </div>
                )}
            </div>

            {/* Right: Hint */}
            {hasSelection && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Changing scope resets chat
                </div>
            )}
        </div>
    );
};
