import { system, ItemStack, Entity, world } from "@minecraft/server";
import { ChickenVariantType, ItemDrop, getChickenVariant } from "../chicken_data/ChickenData";
import { Logger } from "../utils/CRSLogger";
import { ChickenVariants } from "../chicken_data/ChickenVariants";
import { getNextRandomSpawnTick } from "../utils/TickUtils";

const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  PROPERTY_NEXT_LAY_ATTEMPT: "crs_mf:next_lay_attempt",
  INITIAL_TICKS_UNTIL_LAY: -1,
  DEFAULT_SPAWN_TICK_RANGE: { MIN: 300, MAX: 600 },
  LAY_CHECK_INTERVAL: 10, // Configurable interval
} as const;

function getWeightedRandomItem(items: ItemDrop[]): string {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) return entry.itemId;
  }
  return items[0].itemId;
}

function getNextLayTick(variantData: any): number {
  return getNextRandomSpawnTick(
    variantData.minSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MIN,
    variantData.maxSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MAX
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class ResourceLaying {
  constructor() {
    this.handleLaying();
  }

  private handleLaying(): void {
    system.runInterval(() => {
      const currentTick = system.currentTick;
      // Query all loaded resource chickens in all loaded dimensions
      // For simplicity, use the overworld only; extend as needed for other dimensions
      const overworld = world.getDimension("overworld");
      const chickens = overworld.getEntities({ type: CONFIG.CHICKEN_TYPE_ID });
      for (const entity of chickens) {
        if (!entity.isValid) continue;

        // Spread out checks using hash offset
        const id = entity.id ?? (entity as any).uniqueId ?? JSON.stringify(entity.location);
        const offset = hashString(id) % CONFIG.LAY_CHECK_INTERVAL;
        if ((currentTick + offset) % CONFIG.LAY_CHECK_INTERVAL !== 0) continue;

        let nextLayAttempt = entity.getDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT) as number;

        let variant: ChickenVariantType;
        let variantData: (typeof ChickenVariants)[keyof typeof ChickenVariants];
        try {
          variant = getChickenVariant(entity);
          variantData = ChickenVariants[variant];
          if (!variantData) throw new Error(`Unknown variant ${variant}`);
        } catch (e) {
          Logger.warn(`Failed to get variant for chicken ${id}: ${e}`);
          continue;
        }

        if (nextLayAttempt === CONFIG.INITIAL_TICKS_UNTIL_LAY) {
          const next = getNextLayTick(variantData);
          entity.setDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT, next);
          Logger.debug(`Set nextLayAttempt to ${next} for chicken ${id}`);
          continue;
        }

        if (currentTick < nextLayAttempt) continue;

        // Skip laying if this chicken is a baby
        const isBaby = !!entity.getComponent?.("minecraft:is_baby");
        if (isBaby) {
          continue;
        }

        // Lay resource (only once even if overdue)
        const itemId = getWeightedRandomItem(variantData.items);
        const itemStack = new ItemStack(itemId, 1);

        try {
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.dimension.spawnParticle("minecraft:crop_growth_emitter", entity.location);
          entity.dimension.playSound?.("mob.chicken.plop", entity.location, { volume: 1, pitch: 1 });
        } catch (e) {
          Logger.debug(`Failed to spawn item for chicken ${id} at ${JSON.stringify(entity.location)}: ${e}`);
          // Even if it fails, just schedule the next lay attempt as normal
        }

        // Always set up the next lay attempt, regardless of success
        const next = getNextLayTick(variantData);
        entity.setDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT, next);
        Logger.debug(`Updated nextLayAttempt to ${next} for chicken ${id}`);
      }
    }, CONFIG.LAY_CHECK_INTERVAL); // Use configurable interval
  }
}
