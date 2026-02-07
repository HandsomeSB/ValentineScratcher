/**
 * Audio Manager using Web Audio API
 *
 * Generates procedural sounds for the lottery scratcher:
 * - Scratch sound (white noise)
 * - Win sound (ascending tones)
 * - Completion celebration sound
 */

class AudioManagerClass {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;

  /**
   * Initializes the audio context on user interaction
   * Must be called after a user gesture (click, touch, etc.)
   */
  init(): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.context) {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Toggles audio mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  /**
   * Sets the mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Gets the current mute state
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a scratch sound (white noise burst)
   */
  playScratch(): void {
    if (this.isMuted || !this.context) return;

    try {
      const duration = 0.05;
      const bufferSize = this.context.sampleRate * duration;
      const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 0.3 - 0.15;
      }

      const source = this.context.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.context.createGain();
      gainNode.gain.value = 0.1;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play scratch sound:', error);
    }
  }

  /**
   * Plays a win sound (ascending tones: C5, E5, G5)
   */
  playWin(): void {
    if (this.isMuted || !this.context) return;

    try {
      const now = this.context.currentTime;
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

      frequencies.forEach((freq, index) => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3 + index * 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.context!.destination);

        oscillator.start(now + index * 0.1);
        oscillator.stop(now + 0.4 + index * 0.1);
      });
    } catch (error) {
      console.warn('Failed to play win sound:', error);
    }
  }

  /**
   * Plays a completion celebration sound (melody: C5, D5, E5, G5, A5)
   */
  playComplete(): void {
    if (this.isMuted || !this.context) return;

    try {
      const now = this.context.currentTime;
      const melody = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5, D5, E5, G5, A5

      melody.forEach((freq, index) => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';

        gainNode.gain.value = 0.15;
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4 + index * 0.08);

        oscillator.connect(gainNode);
        gainNode.connect(this.context!.destination);

        oscillator.start(now + index * 0.08);
        oscillator.stop(now + 0.5 + index * 0.08);
      });
    } catch (error) {
      console.warn('Failed to play complete sound:', error);
    }
  }

  /**
   * Plays a lose sound (descending tone)
   */
  playLose(): void {
    if (this.isMuted || !this.context) return;

    try {
      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.frequency.value = 200;
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      oscillator.type = 'sine';

      gainNode.gain.value = 0.1;
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Failed to play lose sound:', error);
    }
  }
}

// Export a singleton instance
export const AudioManager = new AudioManagerClass();
