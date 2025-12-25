import React from 'react';
import { DocumentItem } from './DocumentItem';
import type { DocumentMetadata } from '../../types/api';

interface DocumentListProps {
    documents: DocumentMetadata[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, selectedIds, onToggle }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {documents.map(doc => (
                <DocumentItem
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedIds.includes(doc.id)}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
};
