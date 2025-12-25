import { useChat } from './hooks/useChat';
import { MessageList } from './components/Chat/MessageList';
import { InputArea } from './components/Chat/InputArea';
import { AlertCircle } from 'lucide-react';

function App() {
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh', // Full viewport height
      backgroundColor: 'var(--bg-app)',
      position: 'relative'
    }}>

      {/* Error Toast */}
      {error && (
        <div style={{
          position: 'absolute',
          top: 'var(--space-4)',
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
          {error}
        </div>
      )}

      {/* Main Chat Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent scroll on body, let MessageList scroll
        width: '100%'
      }}>
        <MessageList messages={messages} isLoading={isLoading} />
      </main>

      {/* Footer / Input */}
      <footer style={{
        padding: 'var(--space-4) 0',
        backgroundColor: 'var(--bg-app)' // Match bg to blend in
      }}>
        <InputArea onSend={sendMessage} isLoading={isLoading} messagesCount={messages.length} />
      </footer>

    </div>
  );
}

export default App;
