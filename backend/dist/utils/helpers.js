"use strict";
// my-backend/src/utils/helpers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = generateUniqueId;
// ------------------------
/**
 * Generate a unique ID with the specified prefix
 * @param prefix Prefix for the ID
 * @param length Length of the random part of the ID
 * @returns A unique ID with the specified prefix
 */
// ------------------------
function generateUniqueId(prefix, length = 6) {
    // ------------------------
    // Generate a random number and pad it with leading zeros to ensure it has the specified length.
    // ------------------------
    const randomPart = Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, "0");
    return `${prefix}-${randomPart}`;
}
