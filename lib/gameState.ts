/**
 * Game state management with localStorage persistence
 *
 * Manages the state of the lottery scratcher game including:
 * - Collected words
 * - Game progress
 * - Completion status
 */

export interface GameState {
  collectedWords: string[];
  totalWords: number;
  isComplete: boolean;
  encodedMessage: string;
}

const STORAGE_PREFIX = 'valentine_scratcher_';

/**
 * Gets the storage key for a specific encoded message
 */
function getStorageKey(encodedMessage: string): string {
  return `${STORAGE_PREFIX}${encodedMessage}`;
}

/**
 * Initializes a new game state for a message
 * @param encodedMessage - The URL-encoded message
 * @param totalWords - Total number of words in the message
 * @returns A new game state object
 */
export function initializeGameState(
  encodedMessage: string,
  totalWords: number
): GameState {
  return {
    collectedWords: [],
    totalWords,
    isComplete: false,
    encodedMessage,
  };
}

/**
 * Loads game state from localStorage
 * @param encodedMessage - The URL-encoded message
 * @returns The saved game state, or null if not found
 */
export function loadGameState(encodedMessage: string): GameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = getStorageKey(encodedMessage);
    const saved = localStorage.getItem(key);

    if (!saved) return null;

    const state = JSON.parse(saved) as GameState;

    // Validate the state
    if (!Array.isArray(state.collectedWords)) return null;

    return state;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Saves game state to localStorage
 * @param state - The game state to save
 */
export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(state.encodedMessage);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

/**
 * Adds a word to the collected words
 * @param state - The current game state
 * @param word - The word to add
 * @returns The updated game state
 */
export function addWord(state: GameState, word: string): GameState {
  const newState: GameState = {
    ...state,
    collectedWords: [...state.collectedWords, word],
  };

  // Check if complete
  if (newState.collectedWords.length >= newState.totalWords) {
    newState.isComplete = true;
  }

  saveGameState(newState);
  return newState;
}

/**
 * Resets the game state for a message
 * @param encodedMessage - The URL-encoded message
 */
export function resetGameState(encodedMessage: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(encodedMessage);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to reset game state:', error);
  }
}

/**
 * Gets or creates game state for a message
 * @param encodedMessage - The URL-encoded message
 * @param totalWords - Total number of words in the message
 * @returns The current or new game state
 */
export function getOrCreateGameState(
  encodedMessage: string,
  totalWords: number
): GameState {
  const existing = loadGameState(encodedMessage);

  if (existing) {
    // Update totalWords if it changed (message was updated)
    if (existing.totalWords !== totalWords) {
      existing.totalWords = totalWords;
      saveGameState(existing);
    }
    return existing;
  }

  const newState = initializeGameState(encodedMessage, totalWords);
  saveGameState(newState);
  return newState;
}

/**
 * Checks if a word has already been collected
 * @param state - The current game state
 * @param word - The word to check
 * @returns true if the word is already collected
 */
export function hasWord(state: GameState, word: string): boolean {
  return state.collectedWords.includes(word);
}

/**
 * Gets the next uncollected word from a word list
 * @param words - The full list of words in the message
 * @param state - The current game state
 * @returns The next word to collect, or null if all collected
 */
export function getNextWord(words: string[], state: GameState): string | null {
  for (const word of words) {
    if (!hasWord(state, word)) {
      return word;
    }
  }
  return null;
}
