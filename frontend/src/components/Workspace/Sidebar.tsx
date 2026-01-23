import { ShieldCheck, Key, Moon, Sun } from 'lucide-react';
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
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    documents,
    selectedIds,
    onToggle,
    apiKey,
    onApiKeyChange,
    onUploadClick,
    isDarkMode,
    onToggleTheme
}) => {
    return (
        <div style={{
            width: '280px',
            height: '100vh',
            borderRight: '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-sidebar)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4)',
            flexShrink: 0,
            backdropFilter: 'blur(10px)', // Glassmorphism
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
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
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease'
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

            {/* Footer */}
            <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-tertiary)'
            }}>
                <button
                    onClick={onToggleTheme}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>
    );
};
