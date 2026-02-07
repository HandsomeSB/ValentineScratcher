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

export interface ScratcherCard {
  id: number;
  yourNumber: number;
  prizeNumbers: number[];
  isRevealed: boolean;
  isWin: boolean;
  isActive: boolean; // true = center position, false = in stack
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const encodedMessage = params.message as string;

  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [cards, setCards] = useState<ScratcherCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [enteringCardId, setEnteringCardId] = useState<number | null>(null);

  const activeCard = cards.find(c => c.isActive);
  const stackedCards = cards.filter(c => !c.isActive);

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
      createNewCard();
    } else {
      setShowShareModal(true);
      setShowConfetti(true);
    }

    setIsLoading(false);
  }, [encodedMessage]);

  const createNewCard = () => {
    const yourNumber = generateRandomNumber();
    const prizeNumbers = generatePrizeNumbers();
    const isWin = checkWin(yourNumber, prizeNumbers);
    const newId = Date.now();

    const newCard: ScratcherCard = {
      id: newId,
      yourNumber,
      prizeNumbers,
      isRevealed: false,
      isWin,
      isActive: true,
    };

    setCards(prev => [...prev, newCard]);
    setEnteringCardId(newId);

    // Clear entering state after animation
    setTimeout(() => {
      setEnteringCardId(null);
    }, 500);
  };

  const handleCardRevealed = () => {
    if (!activeCard || !gameState) return;

    // Mark the active card as revealed
    setCards(prev => prev.map(c =>
      c.id === activeCard.id ? { ...c, isRevealed: true } : c
    ));
    setShowAnnouncement(true);

    if (activeCard.isWin) {
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
    if (gameState?.isComplete || !activeCard) return;

    // Close announcement
    setShowAnnouncement(false);

    // Move active card to stack (this triggers the CSS transition)
    setCards(prev => prev.map(c =>
      c.id === activeCard.id ? { ...c, isActive: false } : c
    ));

    // Create new card after a brief delay for the transition
    setTimeout(() => {
      // Limit stack to 15 cards
      setCards(prev => {
        const stacked = prev.filter(c => !c.isActive);
        if (stacked.length > 15) {
          const toRemove = stacked.slice(0, stacked.length - 15);
          return prev.filter(c => !toRemove.some(r => r.id === c.id));
        }
        return prev;
      });

      createNewCard();
    }, 500);
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
    setCards([]);
    createNewCard();
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
    <div className="game-layout">
      {/* Single container for all cards */}
      <div className="cards-container">
        {/* Render all cards in the same container */}
        {cards.map((card) => {
          const stackIndex = card.isActive
            ? -1
            : stackedCards.findIndex(c => c.id === card.id);

          return (
            <div
              key={card.id}
              className={`game-card ${
                card.isActive
                  ? `game-card-active ${enteringCardId === card.id ? 'game-card-entering' : ''}`
                  : 'game-card-stacked'
              }`}
              style={{
                '--stack-index': stackIndex,
                '--stack-count': stackedCards.length,
              } as React.CSSProperties}
            >
              <Card
                yourNumber={card.yourNumber}
                prizeNumbers={card.prizeNumbers}
                onAllRevealed={card.isActive ? handleCardRevealed : undefined}
                isRevealed={card.isRevealed}
              />
              {card.isActive && (
                <p className="game-card-status text-sm text-zinc-400">
                  {card.isRevealed
                    ? (card.isWin ? 'You matched a number!' : 'No match this time')
                    : 'Scratch all cards to reveal the result'
                  }
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Section */}
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

        {/* Controls */}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={handleReset} className="btn btn-ghost text-sm">
            Reset
          </button>
          <button onClick={handleBackToHome} className="btn btn-ghost text-sm">
            Home
          </button>
        </div>
      </div>

      {/* Modals & Effects */}
      <AnnouncementModal
        isOpen={showAnnouncement}
        isWin={activeCard?.isWin || false}
        yourNumber={activeCard?.yourNumber || 0}
        prizeNumbers={activeCard?.prizeNumbers || []}
        newWord={
          activeCard?.isWin && gameState
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
