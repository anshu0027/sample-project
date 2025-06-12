// my-backend/src/utils/helpers.ts

// ------------------------
/**
 * Generate a unique ID with the specified prefix
 * @param prefix Prefix for the ID
 * @param length Length of the random part of the ID
 * @returns A unique ID with the specified prefix
 */
// ------------------------
export function generateUniqueId(prefix: string, length: number = 6): string {
  // ------------------------
  // Generate a random number and pad it with leading zeros to ensure it has the specified length.
  // ------------------------
  const randomPart = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
  return `${prefix}-${randomPart}`;
}
