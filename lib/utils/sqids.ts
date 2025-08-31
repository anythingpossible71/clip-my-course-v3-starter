import Sqids from "sqids";

// Initialize Sqids with a secret alphabet for encoding
// In production, this should be in environment variables
const SQIDS_ALPHABET =
  process.env.SQIDS_ALPHABET || "FxnXM1kBN6cuhsAvjW3Co7l2RePyY8DwaU04Tzt9fHQrqSVKdpimLGIJOgb5ZE";

// Create singleton instance
const sqids = new Sqids({
  alphabet: SQIDS_ALPHABET,
  minLength: 6, // Minimum length of encoded IDs
});

/**
 * Encode a numeric ID to a user-friendly string
 * @param id - The numeric ID to encode
 * @returns The encoded string ID
 */
export function encodeId(id: number): string {
  return sqids.encode([id]);
}

/**
 * Decode a user-friendly string back to numeric ID
 * @param encodedId - The encoded string ID
 * @returns The numeric ID or null if invalid
 */
export function decodeId(encodedId: string): number | null {
  const decoded = sqids.decode(encodedId);
  return decoded.length > 0 ? decoded[0] : null;
}

/**
 * Encode multiple IDs at once
 * @param ids - Array of numeric IDs
 * @returns Array of encoded string IDs
 */
export function encodeIds(ids: number[]): string[] {
  return ids.map((id) => encodeId(id));
}

/**
 * Type guard to check if a string is a valid encoded ID
 * @param value - The value to check
 * @returns true if the value can be decoded to a valid ID
 */
export function isValidEncodedId(value: string): boolean {
  const decoded = decodeId(value);
  return decoded !== null && decoded > 0;
}

/**
 * Middleware helper to decode ID from request params
 * @param encodedId - The encoded ID from URL params
 * @returns The decoded numeric ID
 * @throws Error if the ID is invalid
 */
export function requireDecodedId(encodedId: string): number {
  const id = decodeId(encodedId);
  if (id === null || id <= 0) {
    throw new Error("Invalid ID");
  }
  return id;
}
