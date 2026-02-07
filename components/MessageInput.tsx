'use client';

import { useState } from 'react';
import { encodeMessage } from '@/lib/urlEncoder';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const handleGenerate = () => {
    setError('');
    setCopied(false);

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (wordCount < 3) {
      setError('Message should have at least 3 words');
      return;
    }

    try {
      const encoded = encodeMessage(message.trim());
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${origin}/${encoded}`;
      setGeneratedLink(link);
    } catch (err) {
      setError('Failed to generate link. Please try again.');
      console.error(err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="card max-w-xl w-full p-8 sm:p-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-rose-800 mb-3">
          Valentine&apos;s Scratcher
        </h1>
        <p className="text-zinc-500 text-base">
          Create a lottery scratcher to reveal your secret message
        </p>
      </div>

      <div className="space-y-6">
        {/* Message Input */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Your message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Will you be my valentine?"
            className="form-textarea"
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-3 text-sm text-zinc-400">
            <span className={wordCount >= 3 ? 'text-emerald-600 font-medium' : ''}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <span>{message.length}/200</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border-2 border-red-500">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="btn btn-primary w-full"
        >
          Generate Link
        </button>

        {/* Generated Link */}
        {generatedLink && (
          <div className="link-box space-y-4">
            <label className="block text-sm font-medium text-zinc-700">
              Your shareable link
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="form-input flex-1 text-sm"
              />
              <button
                onClick={handleCopy}
                className="btn btn-secondary whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              Share this link — they&apos;ll scratch cards to reveal your message word by word.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="divider" />

        <div>
          <h3 className="text-sm font-semibold text-zinc-700 mb-4">
            How it works
          </h3>
          <ol className="space-y-3 text-sm text-zinc-600">
            <li className="flex gap-4 items-start">
              <span className="step-number">1</span>
              <span>Enter your message (at least 3 words)</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="step-number">2</span>
              <span>Generate and share the unique link</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="step-number">3</span>
              <span>They scratch lottery cards — each win reveals a word</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
