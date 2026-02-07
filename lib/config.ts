/**
 * Game configuration constants
 *
 * Centralized configuration for the lottery scratcher game mechanics
 */

export const GAME_CONFIG = {
  // Scratcher mechanics
  SCRATCH_THRESHOLD: 0.4, // 40% of area must be scratched to reveal
  SCRATCH_RADIUS: 20, // Pixel radius of scratch brush

  // Canvas dimensions
  CARD_WIDTH: 300,
  CARD_HEIGHT: 200,

  // Number generation
  MIN_NUMBER: 1,
  MAX_NUMBER: 10,
  PRIZE_COUNT: 6, // Number of prize numbers

  // Visual
  OVERLAY_COLOR: '#d4d4d8', // Gray scratch overlay
  WIN_COLOR: '#059669', // Green for winning cards
  LOSE_COLOR: '#dc2626', // Red for losing cards

  // Audio (Web Audio API frequencies)
  SCRATCH_FREQUENCY: 80, // Hz for scratch sound
  WIN_FREQUENCY: 880, // Hz for win sound
  CELEBRATION_FREQUENCY: 1320, // Hz for celebration

  // Rose theme colors
  ROSE_50: '#fff1f2',
  ROSE_100: '#ffe4e6',
  ROSE_600: '#e11d48',
  ROSE_700: '#be123c',
  ROSE_800: '#9f1239',
  VALENTINE_PINK: '#fecdd3',
  VALENTINE_DARK_RED: '#9f1239',
} as const;

/**
 * Generates a random number within the game's range
 */
export function generateRandomNumber(): number {
  return Math.floor(
    Math.random() * (GAME_CONFIG.MAX_NUMBER - GAME_CONFIG.MIN_NUMBER + 1)
  ) + GAME_CONFIG.MIN_NUMBER;
}

/**
 * Generates an array of unique random prize numbers
 * @param count - Number of prizes to generate (default: 6)
 * @returns Array of unique random numbers
 */
export function generatePrizeNumbers(count: number = GAME_CONFIG.PRIZE_COUNT): number[] {
  const numbers = new Set<number>();

  while (numbers.size < count) {
    numbers.add(generateRandomNumber());
  }

  return Array.from(numbers);
}

/**
 * Checks if the player's number matches any prize numbers
 * @param yourNumber - The player's number
 * @param prizeNumbers - Array of prize numbers
 * @returns true if there's a match (win), false otherwise
 */
export function checkWin(yourNumber: number, prizeNumbers: number[]): boolean {
  return prizeNumbers.includes(yourNumber);
}
