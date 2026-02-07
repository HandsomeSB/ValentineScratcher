'use client';

import { useRef } from 'react';
import ScratchCard from './ScratchCard';
import { GAME_CONFIG } from '@/lib/config';

interface PrizeScratcherProps {
  prizeNumbers: number[];
  onAllRevealed?: () => void;
  isRevealed?: boolean;
}

export default function PrizeScratcher({ prizeNumbers, onAllRevealed, isRevealed }: PrizeScratcherProps) {
  const revealedCount = useRef(0);

  const handlePrizeRevealed = () => {
    revealedCount.current += 1;

    if (revealedCount.current >= prizeNumbers.length && onAllRevealed) {
      onAllRevealed();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-center" style={{ color: GAME_CONFIG.VALENTINE_DARK_RED }}>
          Prize Numbers
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {prizeNumbers.map((number, index) => (
          <ScratchCard
            key={index}
            text={number.toString()}
            width={100}
            height={80}
            onReveal={handlePrizeRevealed}
            isRevealed={isRevealed}
            revealedBgColor="#F8BBD0"
          />
        ))}
      </div>
    </div>
  );
}
