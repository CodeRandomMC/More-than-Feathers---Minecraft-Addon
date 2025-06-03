/**
 * Utility functions for random selection and hashing.
 * @module utils/RandomUtils
 */

/**
 * Returns a weighted random item from an array.
 * @param items Array of items with a weight property.
 * @param getId Function to get the id from the item (optional, defaults to item itself).
 * @returns The id of the selected item.
 */
export function getWeightedRandomItem<T>(items: T[], getId: (item: T) => string = (item: any) => item): string {
  const totalWeight = items.reduce((sum: number, entry: any) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of items) {
    random -= (entry as any).weight;
    if (random <= 0) return getId(entry);
  }
  return getId(items[0]);
}

/**
 * Generates a simple hash from a string.
 * @param str The string to hash.
 * @returns A positive integer hash.
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
