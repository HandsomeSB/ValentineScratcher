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
    const text = encodeURIComponent(`I just revealed a secret message: "${message}"`);
    const url = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="card p-8 sm:p-10 max-w-md w-full text-center modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-3xl font-semibold text-rose-800 mb-6">
          Congratulations!
        </h2>

        <div className="mb-8">
          <p className="text-sm text-zinc-500 mb-4">
            You&apos;ve revealed the complete message:
          </p>
          <p className="font-display text-lg text-rose-700 italic px-5 py-6 rounded-2xl bg-rose-50">
            &ldquo;{message}&rdquo;
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={handleShareTwitter}
            className="btn w-full bg-sky-500 text-white hover:bg-sky-600"
          >
            Share on Twitter
          </button>

          <button
            onClick={handleCopyLink}
            className="btn btn-secondary w-full"
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="flex gap-3 justify-center pt-6 border-t border-zinc-200">
          <button onClick={onReset} className="btn btn-secondary">
            Play Again
          </button>
          <button onClick={onNewMessage} className="btn btn-primary">
            Create New
          </button>
        </div>
      </div>
    </div>
  );
}
