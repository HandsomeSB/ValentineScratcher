'use client';

import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onReset: () => void;
  onNewMessage: () => void;
}

export default function ShareModal({ isOpen, message, onClose, onReset, onNewMessage }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`I just revealed a secret message: "${message}" 💝`);
    const url = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-enter"
      style={{ backgroundColor: 'rgba(136, 14, 79, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl modal-content-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--valentine-dark-red)' }}>
          🎉 Congratulations! 🎉
        </h2>

        <div className="mb-8">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--valentine-red)' }}>
            You've revealed the complete message:
          </p>
          <p className="text-2xl font-bold italic px-4 py-6 rounded-xl" style={{
            color: 'var(--valentine-dark-red)',
            backgroundColor: 'var(--valentine-lavender)'
          }}>
            "{message}"
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleShareTwitter}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: '#1DA1F2',
              color: 'white'
            }}
          >
            Share on Twitter
          </button>

          <button
            onClick={handleCopyLink}
            className="btn-secondary w-full"
          >
            {copied ? '✓ Link Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="flex gap-3 justify-center pt-4 border-t" style={{ borderColor: 'var(--valentine-pink)' }}>
          <button onClick={onReset} className="btn-secondary px-6">
            Play Again
          </button>
          <button onClick={onNewMessage} className="btn-primary px-6">
            Create New Message
          </button>
        </div>
      </div>
    </div>
  );
}
