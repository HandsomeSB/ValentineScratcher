/**
 * URL-safe Base64 encoding/decoding for message parameters
 *
 * Encodes messages to be safe for use in URL paths
 * Example: "Will you be my valentine?" -> URL-safe encoded string
 */

/**
 * Encodes a message string to URL-safe Base64
 * @param message - The message to encode
 * @returns URL-safe Base64 encoded string
 */
export function encodeMessage(message: string): string {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  try {
    // Convert string to Base64
    const base64 = btoa(unescape(encodeURIComponent(message)));

    // Make it URL-safe by replacing characters
    return base64
      .replace(/\+/g, '-')  // Replace + with -
      .replace(/\//g, '_')  // Replace / with _
      .replace(/=/g, '');   // Remove padding =
  } catch (error) {
    console.error('Failed to encode message:', error);
    throw new Error('Invalid message encoding');
  }
}

/**
 * Decodes a URL-safe Base64 string back to the original message
 * @param encoded - The URL-safe Base64 encoded string
 * @returns The decoded message string, or null if decoding fails
 */
export function decodeMessage(encoded: string): string | null {
  if (!encoded || encoded.trim().length === 0) {
    return null;
  }

  try {
    // Restore Base64 format from URL-safe format
    let base64 = encoded
      .replace(/-/g, '+')  // Restore + from -
      .replace(/_/g, '/'); // Restore / from _

    // Add back padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode from Base64 to original string
    return decodeURIComponent(escape(atob(base64)));
  } catch (error) {
    console.error('Failed to decode message:', error);
    return null;
  }
}

/**
 * Validates if a string is a valid encoded message
 * @param encoded - The string to validate
 * @returns true if the string can be decoded, false otherwise
 */
export function isValidEncodedMessage(encoded: string): boolean {
  if (!encoded || encoded.trim().length === 0) {
    return false;
  }

  const decoded = decodeMessage(encoded);
  return decoded !== null && decoded.trim().length > 0;
}

/**
 * Gets the word count from an encoded message without fully decoding
 * Useful for progress tracking
 * @param encoded - The encoded message
 * @returns The number of words in the message, or 0 if invalid
 */
export function getWordCount(encoded: string): number {
  const decoded = decodeMessage(encoded);
  if (!decoded) return 0;

  return decoded.trim().split(/\s+/).length;
}
