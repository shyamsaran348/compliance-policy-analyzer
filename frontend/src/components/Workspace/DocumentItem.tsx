import React from 'react';
import { FileText, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import type { DocumentMetadata } from '../../types/api';

interface DocumentItemProps {
    doc: DocumentMetadata;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ doc, isSelected, onToggle }) => {
    return (
        <div
            onClick={() => doc.status === 'available' && onToggle(doc.id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                cursor: doc.status === 'available' ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                opacity: doc.status === 'available' ? 1 : 0.6
            }}
        >
            {/* Checkbox Icon */}
            <div style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
                {isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </div>

            {/* Document Info */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}>
                    <FileText size={14} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.filename}
                    </span>
                </div>
            </div>

            {/* Status Indicator */}
            {doc.status === 'processing' && (
                <div title="Processing..." style={{ color: 'var(--color-warning)' }}>
                    <Clock size={14} className="spin-slow" />
                </div>
            )}
            {doc.status === 'error' && (
                <div title="Ingestion Failed" style={{ color: 'var(--color-error)' }}>
                    <AlertTriangle size={14} />
                </div>
            )}

            <style>{`
            .spin-slow { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
};
