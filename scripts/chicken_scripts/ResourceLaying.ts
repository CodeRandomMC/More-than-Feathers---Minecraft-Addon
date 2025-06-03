import { system, ItemStack, Entity, world } from "@minecraft/server";
import { ChickenVariantType, ItemDrop, getChickenVariant } from "../chicken_data/ChickenData";
import { Logger } from "../utils/CRSLogger";
import { ChickenVariants } from "../chicken_data/ChickenVariants";
import { getNextRandomSpawnTick } from "../utils/TickUtils";

const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  PROPERTY_NEXT_LAY_ATTEMPT: "crs_mf:next_lay_attempt",
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

function getNextLayCountdown(variantData: any): number {
  const min = variantData.minSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MIN;
  const max = variantData.maxSpawnTick ?? CONFIG.DEFAULT_SPAWN_TICK_RANGE.MAX;
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
        if ((system.currentTick + offset) % CONFIG.LAY_CHECK_INTERVAL !== 0) continue;

        let countdown = entity.getDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT) as number;
        if (typeof countdown !== "number" || countdown <= 0) {
          // Set initial countdown if not set or expired
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
          const next = getNextLayCountdown(variantData);
          entity.setDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT, next);
          Logger.debug(`Set nextLayAttempt countdown to ${next} for chicken ${id}`);
          continue;
        }

        // Skip laying if this chicken is a baby
        const isBaby = !!entity.getComponent?.("minecraft:is_baby");
        if (isBaby) {
          continue;
        }

        // Decrement countdown
        countdown -= CONFIG.LAY_CHECK_INTERVAL;
        if (countdown > 0) {
          entity.setDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT, countdown);
          continue;
        }

        // Lay resource
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
        const itemId = getWeightedRandomItem(variantData.items);
        const itemStack = new ItemStack(itemId, 1);
        try {
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.dimension.spawnParticle("minecraft:crop_growth_emitter", entity.location);
          entity.dimension.playSound?.("mob.chicken.plop", entity.location, { volume: 1, pitch: 1 });
        } catch (e) {
          Logger.debug(`Failed to spawn item for chicken ${id} at ${JSON.stringify(entity.location)}: ${e}`);
        }
        // Reset countdown
        const next = getNextLayCountdown(variantData);
        entity.setDynamicProperty(CONFIG.PROPERTY_NEXT_LAY_ATTEMPT, next);
        Logger.debug(`Reset nextLayAttempt countdown to ${next} for chicken ${id}`);
      }
    }, CONFIG.LAY_CHECK_INTERVAL); // Use configurable interval
  }
}
