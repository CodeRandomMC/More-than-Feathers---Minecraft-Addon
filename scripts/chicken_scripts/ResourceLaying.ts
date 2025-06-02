import { system, ItemStack, Entity } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { ChickenVariantType, ItemDrop, getChickenVariant } from "../chicken_data/ChickenData";
import { Logger } from "../utils/CRSLogger";
import { ChickenVariants } from "../chicken_data/ChickenVariants";

// Configuration constants
const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  DEFAULT_SPAWN_TICK_RANGE: {
    MIN: 300,
    MAX: 600,
  },
  INITIAL_TICKS_UNTIL_LAY: -1,
} as const;

/**
 * Selects a random item from the list based on weights.
 * @param items - Array of item drops with weights
 * @returns The selected item ID
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
 * @param min - Minimum ticks before next spawn
 * @param max - Maximum ticks before next spawn
 * @returns The calculated next spawn tick
 * @throws Error if the range is invalid
 */
function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) {
    throw new Error(`Invalid spawn tick range: min=${min}, max=${max}`);
  }
  return system.currentTick + Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Handles the logic for chickens laying resources, using the static cache from ResourceChickens
 * and dynamic properties on entities.
 */
export class ResourceLaying {
  constructor() {
    this.handleLaying();
  }

  /**
   * Runs every tick to check and process chickens for laying items.
   * @private
   */
  private handleLaying(): void {
    system.runInterval(() => {
      const currentTick = system.currentTick;

      for (const [id, { entity }] of ResourceChickens.chickenCache.entries()) {
        if (entity.typeId !== CONFIG.CHICKEN_TYPE_ID) {
          Logger.warn(`Invalid entity type ${entity.typeId} in cache for ID ${id}`);
          continue;
        }

        let ticksUntilNextLay = entity.getDynamicProperty("ticksUntilNextLay") as number | undefined;
        if (ticksUntilNextLay === undefined) {
          Logger.warn(`ticksUntilNextLay not set for chicken ${id}, initializing`);
          ticksUntilNextLay = CONFIG.INITIAL_TICKS_UNTIL_LAY;
          entity.setDynamicProperty("ticksUntilNextLay", ticksUntilNextLay);
        }

        // Skip if not ready to lay (-1 indicates fresh spawn or not ready)
        if (ticksUntilNextLay === CONFIG.INITIAL_TICKS_UNTIL_LAY) {
          let variant: ChickenVariantType;
          try {
            variant = getChickenVariant(entity);
          } catch (e) {
            Logger.warn(`Failed to get variant for chicken ${id}: ${e}`);
            continue;
          }

          const variantData = ChickenVariants[variant];
          if (!variantData) {
            Logger.warn(`Unknown variant ${variant} for chicken ${id}, skipping`);
            continue;
          }

          ticksUntilNextLay = getNextRandomSpawnTick(
            variantData.minSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MIN,
            variantData.maxSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MAX
          );
          entity.setDynamicProperty("ticksUntilNextLay", ticksUntilNextLay);
          Logger.debug(`Set ticksUntilNextLay to ${ticksUntilNextLay} for chicken ${id}`);
          continue;
        }

        if (currentTick < ticksUntilNextLay) continue;

        let variant: ChickenVariantType;
        try {
          variant = getChickenVariant(entity);
        } catch (e) {
          Logger.warn(`Failed to get variant for chicken ${id}: ${e}`);
          continue;
        }

        const variantData = ChickenVariants[variant];
        if (!variantData) {
          Logger.warn(`Unknown variant ${variant} for chicken ${id}, skipping`);
          continue;
        }

        const itemId = getWeightedRandomItem(variantData.items);
        const itemStack = new ItemStack(itemId, 1);

        try {
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.dimension.spawnParticle("minecraft:crop_growth_emitter", entity.location);
          try {
            entity.dimension.playSound("mob.chicken.plop", entity.location, { volume: 1, pitch: 1 });
          } catch (error) {
            Logger.warn(`Failed to play sound for chicken ${id}: ${error}`);
          }
        } catch (e) {
          Logger.warn(`Failed to spawn item for chicken ${id}: ${e}`);
          continue;
        }

        // Reset ticksUntilNextLay for the next cycle
        ticksUntilNextLay = getNextRandomSpawnTick(
          variantData.minSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MIN,
          variantData.maxSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MAX
        );
        entity.setDynamicProperty("ticksUntilNextLay", ticksUntilNextLay);
        Logger.debug(`Updated ticksUntilNextLay to ${ticksUntilNextLay} for chicken ${id}`);
      }
    }, 1);
  }
}
