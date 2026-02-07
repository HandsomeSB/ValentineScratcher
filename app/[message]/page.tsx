'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { decodeMessage, isValidEncodedMessage } from '@/lib/urlEncoder';
import { getOrCreateGameState, addWord, resetGameState, GameState } from '@/lib/gameState';
import { generateRandomNumber, generatePrizeNumbers, checkWin } from '@/lib/config';
import { AudioManager } from '@/lib/audioManager';
import Card from '@/components/Card';
import Confetti from '@/components/Confetti';
import ShareModal from '@/components/ShareModal';
import AnnouncementModal from '@/components/AnnouncementModal';
import CardStack from '@/components/CardStack';

export interface ScratcherCard {
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
  const [cardHistory, setCardHistory] = useState<ScratcherCard[]>([]);
  const [cardAnimationState, setCardAnimationState] = useState<'entering' | 'active' | 'exiting'>('active');
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    AudioManager.init();

    if (!encodedMessage) {
      setError('No message provided');
      setIsLoading(false);
      return;
    }

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

    const state = getOrCreateGameState(encodedMessage, messageWords.length);
    setGameState(state);

    if (!state.isComplete) {
      generateNewCard();
    } else {
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

    setCardAnimationState('entering');

    // Transition to active after entrance animation completes
    setTimeout(() => {
      setCardAnimationState('active');
    }, 600); // Match cardSlideIn duration
  };

  const handleCardRevealed = () => {
    if (!currentCard || !gameState) return;

    setCurrentCard({ ...currentCard, isRevealed: true });
    setShowAnnouncement(true); // Show popup overlay

    if (currentCard.isWin) {
      AudioManager.playWin();

      const nextWord = words.find((word) => !gameState.collectedWords.includes(word));

      if (nextWord) {
        const newState = addWord(gameState, nextWord);
        setGameState(newState);

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
    if (gameState?.isComplete || !currentCard) return;

    // Close announcement
    setShowAnnouncement(false);

    // Start exit animation
    setCardAnimationState('exiting');

    // Wait for exit animation to complete
    setTimeout(() => {
      // Add current card to history (limit to 15 cards)
      setCardHistory((prev) => {
        const newHistory = [...prev, currentCard];
        return newHistory.slice(-15); // Keep only last 15 cards
      });

      // Generate new card (this will set state to 'entering')
      generateNewCard();
    }, 500); // Match cardSlideToStack duration
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
    setShowAnnouncement(false);
    setCardHistory([]);
    generateNewCard();
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-zinc-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-rose-800 mb-3">
            Oops!
          </h1>
          <p className="text-zinc-500 mb-6">{error}</p>
          <button onClick={handleBackToHome} className="btn btn-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (gameState?.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-lg w-full p-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-rose-800 mb-6">
            Congratulations!
          </h1>
          <div className="mb-8">
            <p className="text-sm text-zinc-500 mb-4">Your complete message:</p>
            <p className="font-display text-xl text-rose-700 italic px-5 py-6 rounded-2xl bg-rose-50">
              &ldquo;{decodedMessage}&rdquo;
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={handleReset} className="btn btn-secondary">
              Play Again
            </button>
            <button onClick={handleBackToHome} className="btn btn-primary">
              Create New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* Left Column: Card Stack */}
      <div className="card-stack-column">
        <CardStack cards={cardHistory} />
      </div>

      {/* Center Column: Active Card */}
      <div className="card-area">
        {currentCard && !currentCard.isRevealed && (
          <div
            className={`space-y-4 w-full max-w-md px-4 card-${cardAnimationState}`}
          >
            <Card
              yourNumber={currentCard.yourNumber}
              prizeNumbers={currentCard.prizeNumbers}
              onAllRevealed={handleCardRevealed}
              isRevealed={false}
            />
            <p className="text-center text-sm text-zinc-400">
              Scratch all cards to reveal the result
            </p>
          </div>
        )}

        {currentCard && currentCard.isRevealed && (
          <div
            className={`space-y-4 w-full max-w-md px-4 card-${cardAnimationState}`}
          >
            <Card
              yourNumber={currentCard.yourNumber}
              prizeNumbers={currentCard.prizeNumbers}
              onAllRevealed={handleCardRevealed}
              isRevealed={true}
            />
            <p className="text-center text-sm text-zinc-400">
              {currentCard.isWin ? 'You matched a number!' : 'No match this time'}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-3 justify-center pb-6">
          <button onClick={handleReset} className="btn btn-ghost text-sm">
            Reset
          </button>
          <button onClick={handleBackToHome} className="btn btn-ghost text-sm">
            Home
          </button>
        </div>
      </div>

      {/* Right Column: Progress */}
      <div className="progress-section">
        <div className="progress-box">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zinc-700">Words Collected</span>
            <span className="text-sm font-semibold text-rose-600">
              {gameState?.collectedWords.length || 0} / {words.length}
            </span>
          </div>
          {gameState && gameState.collectedWords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gameState.collectedWords.map((word, index) => (
                <span key={index} className="word-pill">
                  {word}
                </span>
              ))}
            </div>
          )}
          {gameState && gameState.collectedWords.length === 0 && (
            <p className="text-sm text-zinc-400">
              Win cards to reveal words from the secret message
            </p>
          )}
        </div>
      </div>

      {/* Modals & Effects */}
      <AnnouncementModal
        isOpen={showAnnouncement}
        isWin={currentCard?.isWin || false}
        yourNumber={currentCard?.yourNumber || 0}
        prizeNumbers={currentCard?.prizeNumbers || []}
        newWord={
          currentCard?.isWin && gameState
            ? gameState.collectedWords[gameState.collectedWords.length - 1]
            : undefined
        }
        onNewCard={handleNewCard}
        isGameComplete={gameState?.isComplete || false}
      />

      <Confetti isActive={showConfetti} />

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
