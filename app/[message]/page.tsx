'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { decodeMessage, isValidEncodedMessage } from '@/lib/urlEncoder';
import { getOrCreateGameState, addWord, resetGameState, GameState } from '@/lib/gameState';
import { generateRandomNumber, generatePrizeNumbers, checkWin } from '@/lib/config';
import { AudioManager } from '@/lib/audioManager';
import NumberScratcher from '@/components/NumberScratcher';
import PrizeScratcher from '@/components/PrizeScratcher';
import Confetti from '@/components/Confetti';
import ShareModal from '@/components/ShareModal';

interface ScratcherCard {
  id: number;
  yourNumber: number;
  prizeNumbers: number[];
  isRevealed: boolean;
  isWin: boolean;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const encodedMessage = params.message as string;

  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentCard, setCurrentCard] = useState<ScratcherCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    // Initialize audio on first interaction
    AudioManager.init();

    if (!encodedMessage) {
      setError('No message provided');
      setIsLoading(false);
      return;
    }

    // Validate and decode message
    if (!isValidEncodedMessage(encodedMessage)) {
      setError('Invalid message link');
      setIsLoading(false);
      return;
    }

    const decoded = decodeMessage(encodedMessage);
    if (!decoded) {
      setError('Could not decode message');
      setIsLoading(false);
      return;
    }

    setDecodedMessage(decoded);
    const messageWords = decoded.trim().split(/\s+/);
    setWords(messageWords);

    // Load or create game state
    const state = getOrCreateGameState(encodedMessage, messageWords.length);
    setGameState(state);

    // Generate first card if not complete
    if (!state.isComplete) {
      generateNewCard();
    } else {
      // Show completion modal if already complete
      setShowShareModal(true);
      setShowConfetti(true);
    }

    setIsLoading(false);
  }, [encodedMessage]);

  const generateNewCard = () => {
    const yourNumber = generateRandomNumber();
    const prizeNumbers = generatePrizeNumbers();
    const isWin = checkWin(yourNumber, prizeNumbers);

    setCurrentCard({
      id: Date.now(),
      yourNumber,
      prizeNumbers,
      isRevealed: false,
      isWin,
    });
  };

  const handleCardRevealed = () => {
    if (!currentCard || !gameState) return;

    // Update card to revealed
    setCurrentCard({ ...currentCard, isRevealed: true });

    // Play win or lose sound
    if (currentCard.isWin) {
      AudioManager.playWin();

      const nextWord = words.find((word) => !gameState.collectedWords.includes(word));

      if (nextWord) {
        const newState = addWord(gameState, nextWord);
        setGameState(newState);

        // Check if game is complete
        if (newState.isComplete) {
          setTimeout(() => {
            AudioManager.playComplete();
            setShowConfetti(true);
            setShowShareModal(true);
          }, 1000);
        }
      }
    } else {
      AudioManager.playLose();
    }
  };

  const handleNewCard = () => {
    if (gameState?.isComplete) return;
    generateNewCard();
  };

  const handleReset = () => {
    if (!encodedMessage) return;

    const confirmed = window.confirm('Are you sure you want to reset your progress?');
    if (!confirmed) return;

    resetGameState(encodedMessage);
    const state = getOrCreateGameState(encodedMessage, words.length);
    setGameState(state);
    setShowConfetti(false);
    setShowShareModal(false);
    generateNewCard();
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4" style={{ color: 'var(--valentine-red)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--valentine-dark-red)' }}>
            Oops!
          </h1>
          <p className="text-lg mb-6 text-gray-600">{error}</p>
          <button onClick={handleBackToHome} className="btn-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (gameState?.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--valentine-dark-red)' }}>
            🎉 Congratulations! 🎉
          </h1>
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--valentine-red)' }}>
              Your complete message:
            </p>
            <p className="text-2xl font-bold italic" style={{ color: 'var(--valentine-dark-red)' }}>
              "{decodedMessage}"
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={handleReset} className="btn-secondary">
              Play Again
            </button>
            <button onClick={handleBackToHome} className="btn-primary">
              Create New Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--valentine-dark-red)' }}>
            💝 Scratch to Win Words!
          </h1>
          <p className="text-lg" style={{ color: 'var(--valentine-red)' }}>
            Match your number to win a word from the secret message
          </p>
        </div>

        {/* Progress section */}
        <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--valentine-lavender)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--valentine-dark-red)' }}>
            Words Collected: <span style={{ color: 'var(--valentine-red)' }}>
              {gameState?.collectedWords.length || 0}/{words.length}
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {gameState?.collectedWords.map((word, index) => (
              <div key={index} className="word-pill">
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* Scratcher cards */}
        <div className="mb-8">
          {currentCard && !currentCard.isRevealed && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <NumberScratcher number={currentCard.yourNumber} isRevealed={false} />
              </div>
              <div className="flex justify-center">
                <PrizeScratcher prizeNumbers={currentCard.prizeNumbers} onAllRevealed={handleCardRevealed} isRevealed={false} />
              </div>
              <div className="text-center text-sm text-gray-500">
                Scratch all cards to reveal the result!
              </div>
            </div>
          )}
          {currentCard && currentCard.isRevealed && (
            <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: currentCard.isWin ? '#e8f5e9' : '#ffebee' }}>
              <p className="text-3xl font-bold mb-4" style={{ color: currentCard.isWin ? 'var(--win-color)' : 'var(--lose-color)' }}>
                {currentCard.isWin ? '🎉 You Won a Word!' : '😔 No Match - Try Again'}
              </p>
              <div className="mb-6 space-y-2">
                <p className="text-lg">Your Number: <span className="font-bold">{currentCard.yourNumber}</span></p>
                <p className="text-lg">Prize Numbers: <span className="font-bold">{currentCard.prizeNumbers.join(', ')}</span></p>
              </div>
              {currentCard.isWin && gameState && (
                <p className="text-lg mb-6 font-semibold" style={{ color: 'var(--valentine-red)' }}>
                  New word collected: "{gameState.collectedWords[gameState.collectedWords.length - 1]}"
                </p>
              )}
              <button onClick={handleNewCard} className="btn-primary text-lg px-8 py-3">
                {gameState?.isComplete ? 'See Final Message' : 'Try Another Card'}
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button onClick={handleReset} className="btn-secondary">
            Reset Progress
          </button>
          <button onClick={handleBackToHome} className="btn-secondary">
            Back to Home
          </button>
        </div>
      </div>

      {/* Confetti effect */}
      <Confetti isActive={showConfetti} />

      {/* Share modal */}
      <ShareModal
        isOpen={showShareModal}
        message={decodedMessage || ''}
        onClose={() => setShowShareModal(false)}
        onReset={handleReset}
        onNewMessage={handleBackToHome}
      />
    </div>
  );
}
