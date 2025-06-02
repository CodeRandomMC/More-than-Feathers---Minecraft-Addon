import { system, ItemStack } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { ChickenVariantType, ItemDrop, chickenVariants, getChickenVariant } from "./ChickenData";
import { Logger } from "../utils/CRSLogger";

/**
 * Selects a random item from the list based on weights.
 * @param items Array of item drops with weights.
 * @returns The selected item ID.
 */
function getWeightedRandomItem(items: ItemDrop[]): string {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) return entry.itemId;
  }
  return items[0].itemId;
}

/**
 * Generates a random spawn tick within the given range.
 * @param min Minimum ticks before next spawn.
 * @param max Maximum ticks before next spawn.
 * @returns The next spawn tick based on current tick.
 */
function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) {
    throw new Error("Invalid range for random spawn tick");
  }
  return system.currentTick + Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * ResourceLaying handles the logic for chickens laying resources,
 * using the static cache from ResourceChickens.
 */
export class ResourceLaying {
  constructor() {
    this.handleLaying();
  }

  /**
   * Runs every tick to check and process chickens for laying items.
   */
  private handleLaying() {
    system.runInterval(() => {
      const currentTick = system.currentTick;

      for (const [id, entry] of ResourceChickens.chickenCache.entries()) {
        const { entity, nextSpawnTick } = entry;

        if (currentTick < nextSpawnTick) continue;

        let variant: ChickenVariantType;
        try {
          variant = getChickenVariant(entity);
        } catch (e) {
          Logger.warn(`Failed to get variant for chicken ${id}: ${e}`);
          continue;
        }

        const variantData = chickenVariants[variant];
        if (!variantData) {
          Logger.warn(`Unknown variant ${variant} for chicken ${id}, skipping.`);
          continue;
        }

        const itemId = getWeightedRandomItem(variantData.items);
        const itemStack = new ItemStack(itemId, 1);

        try {
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.dimension.playSound("plop", entity.location);
        } catch (e) {
          Logger.warn(`Failed to spawn item for chicken ${id}: ${e}`);
          continue;
        }

        entry.nextSpawnTick = getNextRandomSpawnTick(300, 600);
      }
    }, 1);
  }
}