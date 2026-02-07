'use client';

import { ScratcherCard } from '@/app/[message]/page';
import Card from './Card';

interface CardStackProps {
  cards: ScratcherCard[];
}

export default function CardStack({ cards }: CardStackProps) {
  // Show last 5 cards visually (even though we keep 15 in state)
  const visibleCards = cards.slice(-5);

  if (cards.length === 0) {
    return (
      <div className="card-stack">
        <div className="card-stack-empty">
          Completed cards
          <br />
          will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="card-stack">
      {visibleCards.map((card, index) => {
        // Calculate stacking effect - newer cards on top, offset down
        const offsetY = (visibleCards.length - 1 - index) * 8; // Small vertical offset for depth
        const offsetX = (visibleCards.length - 1 - index) * 4; // Small horizontal offset
        const opacity = 0.5 + (index / visibleCards.length) * 0.5; // Newer cards more opaque

        return (
          <div
            key={card.id}
            className="stacked-card"
            style={{
              transform: `translateY(${offsetY}px) translateX(${offsetX}px)`,
              zIndex: index + 1,
              opacity: opacity,
            }}
          >
            <Card
              yourNumber={card.yourNumber}
              prizeNumbers={card.prizeNumbers}
              isRevealed={true}
            />
          </div>
        );
      })}
    </div>
  );
}
