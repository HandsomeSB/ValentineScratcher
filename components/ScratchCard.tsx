'use client';

import { useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '@/lib/config';

interface ScratchCardProps {
  /** Text to display under the scratch overlay */
  text: string;
  /** Width of the canvas */
  width?: number;
  /** Height of the canvas */
  height?: number;
  /** Callback when scratch threshold is reached */
  onReveal?: () => void;
  /** Whether the card has already been revealed */
  isRevealed?: boolean;
  /** Background color when revealed */
  revealedBgColor?: string;
}

export default function ScratchCard({
  text,
  width = GAME_CONFIG.CARD_WIDTH,
  height = GAME_CONFIG.CARD_HEIGHT,
  onReveal,
  isRevealed = false,
  revealedBgColor = '#ffffff',
}: ScratchCardProps) {
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(isRevealed);
  const scratchedPixelsRef = useRef(0);

  // Draw the text layer (bottom canvas)
  useEffect(() => {
    const canvas = textCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = revealedBgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = GAME_CONFIG.VALENTINE_DARK_RED;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }, [text, width, height, revealedBgColor]);

  // Draw the scratch overlay (top canvas)
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || hasRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = GAME_CONFIG.OVERLAY_COLOR;
    ctx.fillRect(0, 0, width, height);

    // Add texture pattern
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 10,
        Math.random() * 10
      );
    }
    ctx.globalAlpha = 1.0;

    scratchedPixelsRef.current = 0;
  }, [text, width, height, hasRevealed]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || hasRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, GAME_CONFIG.SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Throttle the pixel check — only run every N strokes
    scratchedPixelsRef.current += 1;
    if (scratchedPixelsRef.current % 5 !== 0) return;

    // Count actual transparent pixels from the overlay canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparent = 0;
    const totalPixels = width * height;

    // Check alpha channel (every 4th byte) 
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    if (transparent / totalPixels >= GAME_CONFIG.SCRATCH_THRESHOLD) {
      handleReveal();
    }
  };

  const handleReveal = () => {
    if (hasRevealed) return;

    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the entire overlay canvas — text canvas underneath is untouched
    ctx.clearRect(0, 0, width, height);
    setHasRevealed(true);

    if (onReveal) {
      onReveal();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasRevealed) return;
    setIsScratching(true);
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching || hasRevealed) return;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (hasRevealed) return;
    e.preventDefault();
    setIsScratching(true);
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || hasRevealed) return;
    e.preventDefault();
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsScratching(false);
  };

  if (isRevealed && hasRevealed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: revealedBgColor,
          borderColor: GAME_CONFIG.VALENTINE_PINK,
        }}
      >
        <div className="text-3xl font-bold text-center px-4" style={{ color: GAME_CONFIG.VALENTINE_DARK_RED }}>
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}>
      {/* Bottom layer: text */}
      <canvas
        ref={textCanvasRef}
        className="absolute inset-0 rounded-xl"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {/* Top layer: scratchable overlay */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 rounded-xl select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}