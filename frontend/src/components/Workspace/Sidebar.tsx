import { ShieldCheck, Key } from 'lucide-react';
import { DocumentList } from './DocumentList';
import { UploadPlaceholder } from './UploadPlaceholder';
import type { DocumentMetadata } from '../../types/api';

interface SidebarProps {
    documents: DocumentMetadata[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    onUploadClick: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    documents,
    selectedIds,
    onToggle,
    apiKey,
    onApiKeyChange,
    onUploadClick
}) => {
    return (
        <div style={{
            width: '280px',
            height: '100vh',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4)',
            flexShrink: 0
        }}>
            {/* App Header in Sidebar */}
            <div style={{
                marginBottom: 'var(--space-6)',
                paddingBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--border-subtle)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div style={{
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Policy Analyzer
                        </h1>
                    </div>
                </div>

                {/* API Key Input */}
                <div style={{ position: 'relative' }}>
                    <Key size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        placeholder="Enter API Key"
                        style={{
                            width: '100%',
                            padding: '6px 8px 6px 28px',
                            fontSize: '0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            border: apiKey ? '1px solid var(--color-success)' : '1px solid var(--border-subtle)',
                            outline: 'none',
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>
            </div>

            {/* Document Section */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <h2 style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-3)',
                    fontWeight: 600
                }}>
                    Active Workspace
                </h2>

                <DocumentList
                    documents={documents}
                    selectedIds={selectedIds}
                    onToggle={onToggle}
                />

                <UploadPlaceholder onUpload={onUploadClick} />
            </div>

            {/* Footer / User Info could go here */}
            <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)'
            }}>
                v1.0.0 • Local Environment
            </div>
        </div>
    );
};
