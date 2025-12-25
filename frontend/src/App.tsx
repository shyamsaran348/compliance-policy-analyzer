import { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { MessageList } from './components/Chat/MessageList';
import { InputArea } from './components/Chat/InputArea';
import { Sidebar } from './components/Workspace/Sidebar';
import { WorkspaceHeader } from './components/Workspace/WorkspaceHeader';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { DocumentMetadata } from './types/api';
import { documentService, workspaceService } from './api/services';

function App() {
  // Global State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('compliance_api_key') || '');

  // Persist Key
  useEffect(() => {
    localStorage.setItem('compliance_api_key', apiKey);
  }, [apiKey]);

  // Workspace State
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);

  // Chat Hook - initialized with dynamic workspaceId
  const { messages, isLoading, error: chatError, sendMessage, clearChat } = useChat(workspaceId);
  const [appError, setAppError] = useState<string | null>(null);

  // Initial Fetch
  useEffect(() => {
    if (apiKey) {
      loadDocuments();
    }
  }, [apiKey]);

  const loadDocuments = async () => {
    try {
      setAppError(null);
      const docs = await documentService.listDocuments(apiKey);
      console.log("Documents fetched:", docs);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      setAppError("Failed to load documents. Ensure Backend is running and API Key is valid.");
    }
  };

  const handleUpload = async (file: File) => {
    if (!apiKey) {
      setAppError("Please enter API Key first.");
      return;
    }
    setNotification("Uploading document...");
    try {
      const newDoc = await documentService.uploadDocument(file, apiKey);
      setDocuments(prev => [...prev, newDoc]);
      setNotification("Upload complete.");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setAppError("Upload failed.");
    }
  };

  const handleToggleDoc = async (id: string) => {
    setAppError(null);

    // 1. Calculate New Selection
    const isSelected = selectedDocIds.includes(id);
    const newSelection = isSelected
      ? selectedDocIds.filter(docId => docId !== id)
      : [...selectedDocIds, id];

    // 2. Optimistic Update
    setSelectedDocIds(newSelection);
    clearChat();

    if (newSelection.length === 0) {
      setWorkspaceId(undefined);
      setNotification("Workspace cleared.");
      setTimeout(() => setNotification(null), 2000);
      return;
    }

    // 3. Create Workspace
    setNotification("Configuring secure workspace...");
    try {
      const workspace = await workspaceService.createWorkspace({
        name: `Session ${new Date().toLocaleTimeString()}`,
        document_ids: newSelection
      }, apiKey);

      setWorkspaceId(workspace.id);
      setNotification(`Workspace ready (${newSelection.length} docs).`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setAppError("Failed to create workspace context.");
      // Rollback selection? No, just let user try again or unselect.
      setWorkspaceId(undefined);
    }
  };

  // Wrapper to inject app-level API Key if input area logic is bypassed
  const handleSendWrapper = async (text: string, keyFromInput: string) => {
    const effectiveKey = keyFromInput || apiKey;
    if (!effectiveKey) {
      setAppError("API Key is required to chat.");
      return;
    }
    await sendMessage(text, effectiveKey);
  };

  // Derived state for active documents header
  const selectedDocuments = documents.filter(doc => selectedDocIds.includes(doc.id));

  const activeError = appError || chatError;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      backgroundColor: 'var(--bg-app)',
      overflow: 'hidden'
    }}>

      {/* Sidebar - Workspace Manager */}
      <Sidebar
        documents={documents}
        selectedIds={selectedDocIds}
        onToggle={handleToggleDoc}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onUploadClick={handleUpload}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}>

        {/* Workspace Context Header */}
        <WorkspaceHeader selectedDocuments={selectedDocuments} />

        {/* Notification Toast */}
        {notification && (
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <RefreshCw size={14} className="spin-once" />
            {notification}
          </div>
        )}

        {/* Error Toast */}
        {activeError && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-error)',
            color: 'var(--color-error)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            zIndex: 1000,
            border: '1px solid var(--color-error)',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <AlertCircle size={18} />
            {activeError}
          </div>
        )}

        {/* Main Chat Area */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%'
        }}>
          {selectedDocIds.length > 0 ? (
            <MessageList messages={messages} isLoading={isLoading} />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              gap: 'var(--space-4)',
              textAlign: 'center',
              padding: 'var(--space-6)'
            }}>
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-2)'
              }}>
                <AlertCircle size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  No Documents Selected
                </h3>
                <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>
                  Select a document from the sidebar to create a secure workspace and begin analysis.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer / Input */}
        <footer style={{
          padding: 'var(--space-4) 0',
          backgroundColor: 'var(--bg-app)'
        }}>
          <InputArea
            onSend={handleSendWrapper}
            isLoading={isLoading}
            messagesCount={messages.length}
            disabled={selectedDocIds.length === 0 || !workspaceId}
            disabledPlaceholder={
              !workspaceId && selectedDocIds.length > 0
                ? "Configuring workspace..."
                : "Select a document to enable chat..."
            }
          />
        </footer>

        <style>{`
            @keyframes slideIn {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .spin-once { animation: spin 0.5s ease-out; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
        `}</style>
      </div>
    </div>
  );
}

export default App;
