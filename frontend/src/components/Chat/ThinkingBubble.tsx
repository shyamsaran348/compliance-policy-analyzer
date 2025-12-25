import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

export const ThinkingBubble: React.FC = () => {
    const [step, setStep] = React.useState(0);
    const steps = [
        "Scanning policy documents...",
        "Retrieving relevant sections...",
        "Cross-referencing citations...",
        "Generating response..."
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1200); // Change text every 1.2s
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            margin: 'var(--space-6) 0',
            maxWidth: '85%',
            width: '100%',
            animation: 'fadeIn 0.3s ease-in-out'
        }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-tertiary)',
                fontSize: '0.85rem'
            }}>
                <div style={{
                    width: 28, height: 28,
                    borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--bg-surface-hover)',
                    color: 'var(--text-secondary)'
                }}>
                    <Bot size={16} />
                </div>
                <span style={{ fontWeight: 600 }}>Compliance Assistant</span>
            </div>

            {/* Bubble Content */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                borderTopLeftRadius: 0,
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)', // Increased gap
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                minWidth: '240px' // Prevent distinct resize jumps
            }}>
                <Loader2 size={16} className="spin-animation" style={{ flexShrink: 0 }} />
                <span key={step} className="fade-text">
                    {steps[step]}
                </span>
            </div>

            <style>{`
        .spin-animation {
          animation: spin 2s linear infinite;
        }
        .fade-text {
            animation: fadeInText 0.5s ease-in-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInText {
            from { opacity: 0; transform: translateY(2px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};
