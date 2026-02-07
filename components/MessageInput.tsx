'use client';

import { useState } from 'react';
import { encodeMessage } from '@/lib/urlEncoder';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');
    setCopied(false);

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.trim().split(/\s+/).length < 3) {
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
    <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--valentine-dark-red)' }}>
          💝 Valentine's Lottery Scratcher
        </h1>
        <p className="text-lg" style={{ color: 'var(--valentine-red)' }}>
          Create a personalized lottery scratcher to reveal your message!
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--valentine-dark-red)' }}
          >
            Enter your message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Will you be my valentine?"
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
            style={{
              borderColor: 'var(--valentine-pink)',
            }}
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              {message.trim() ? message.trim().split(/\s+/).length : 0} words
            </p>
            <p className="text-sm text-gray-500">
              {message.length}/200 characters
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="btn-primary w-full"
        >
          Generate Link
        </button>

        {generatedLink && (
          <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--valentine-lavender)' }}>
            <label
              className="block text-sm font-semibold"
              style={{ color: 'var(--valentine-dark-red)' }}
            >
              Your shareable link:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-4 py-2 bg-white border-2 rounded-lg text-sm"
                style={{ borderColor: 'var(--valentine-pink)' }}
              />
              <button
                onClick={handleCopy}
                className="btn-secondary px-6 whitespace-nowrap"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Share this link with your valentine! They'll scratch lottery cards to reveal your message word by word.
            </p>
          </div>
        )}

        <div className="pt-4 border-t" style={{ borderColor: 'var(--valentine-pink)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--valentine-dark-red)' }}>
            How it works:
          </h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Enter your message above (at least 3 words)</li>
            <li>2. Click "Generate Link" to create a unique URL</li>
            <li>3. Share the link with your special someone</li>
            <li>4. They scratch lottery cards - each win reveals one word</li>
            <li>5. After collecting all words, your complete message is revealed!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
