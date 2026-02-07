'use client';

import { useRef, useState, useEffect } from 'react';
import ScratchCard from './ScratchCard';

interface CardProps {
  yourNumber: number;
  prizeNumbers: number[];
  onAllRevealed?: () => void;
  isRevealed?: boolean;
}

export default function Card({ yourNumber, prizeNumbers, onAllRevealed, isRevealed }: CardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealedCount = useRef(0);
  const totalCards = prizeNumbers.length + 1; // prize cards + your number card
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleCardRevealed = () => {
    revealedCount.current += 1;

    if (revealedCount.current >= totalCards && onAllRevealed) {
      onAllRevealed();
    }
  };

  // Calculate proportional sizes based on container width
  // Your number card: full width, 1:3 aspect ratio
  const yourNumberWidth = Math.max(containerWidth * 0.85, 200);
  const yourNumberHeight = yourNumberWidth / 3;

  // Prize cards: fit 3 per row with gaps, ~1:1.3 aspect ratio
  const prizeCardWidth = Math.max((containerWidth * 0.85 - 24) / 3, 60); // 24px for gaps
  const prizeCardHeight = prizeCardWidth * 0.78;

  return (
    <div
      ref={containerRef}
      className="scratch-card-container w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="card-divider">
        <span className="text-2xl sm:text-3xl md:text-5xl font-bold text-rose-700 whitespace-nowrap">Match to win!</span>
      </div>

      {/* Your Number Section */}
      <div className="your-number-section">
        <div className="section-label">Your Number</div>
        <div className="your-number-card flex justify-center">
          {containerWidth > 0 && (
            <ScratchCard
              text={yourNumber.toString()}
              width={yourNumberWidth}
              height={yourNumberHeight}
              onReveal={handleCardRevealed}
              isRevealed={isRevealed}
              revealedBgColor="#fff1f2"
            />
          )}
        </div>
      </div>

      {/* Prize Numbers Section */}
      <div className="prize-numbers-section">
        <div className="section-label">Prize Numbers</div>
        <div className="prize-grid flex flex-wrap justify-center gap-2">
          {containerWidth > 0 && prizeNumbers.map((number, index) => (
            <ScratchCard
              key={index}
              text={number.toString()}
              width={prizeCardWidth}
              height={prizeCardHeight}
              onReveal={handleCardRevealed}
              isRevealed={isRevealed}
              revealedBgColor="#ffe4e6"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
