'use client';

import ScratchCard from './ScratchCard';
import { GAME_CONFIG } from '@/lib/config';

interface NumberScratcherProps {
  number: number;
  onReveal?: () => void;
  isRevealed?: boolean;
}

export default function NumberScratcher({ number, onReveal, isRevealed }: NumberScratcherProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-center" style={{ color: GAME_CONFIG.VALENTINE_DARK_RED }}>
          Your Number
        </h3>
      </div>
      <ScratchCard
        text={number.toString()}
        width={150}
        height={120}
        onReveal={onReveal}
        isRevealed={isRevealed}
        revealedBgColor="#FFF0F5"
      />
    </div>
  );
}
