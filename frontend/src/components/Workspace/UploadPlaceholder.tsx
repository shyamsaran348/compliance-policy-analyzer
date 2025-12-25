import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadPlaceholderProps {
    onUpload: (file: File) => void;
}

export const UploadPlaceholder: React.FC<UploadPlaceholderProps> = ({ onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        // Reset so same file can be uploaded again if needed
        if (event.target.value) {
            event.target.value = '';
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf"
                onChange={handleFileChange}
            />
            <button
                onClick={handleClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    width: '100%',
                    padding: 'var(--space-2)',
                    marginTop: 'var(--space-4)',
                    backgroundColor: 'transparent',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity: 1,
                    transition: 'all 0.2s'
                }}
                title="Upload PDF Document"
            >
                <UploadCloud size={16} />
                <span>Upload Document</span>
            </button>
        </>
    );
};
