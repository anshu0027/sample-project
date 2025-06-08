import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID with the specified prefix
 * @param prefix Prefix for the ID
 * @param length Length of the random part of the ID
 * @returns A unique ID with the specified prefix
 */
export function generateUniqueId(prefix: string, length: number = 6): string {
  const randomPart = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
  return `${prefix}-${randomPart}`;
}
