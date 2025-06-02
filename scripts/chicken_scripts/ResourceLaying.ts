import { system, ItemStack, Entity } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { ChickenVariantType, ItemDrop, getChickenVariant } from "../chicken_data/ChickenData";
import { Logger } from "../utils/CRSLogger";
import { ChickenVariants } from "../chicken_data/ChickenVariants";
import { getNextRandomSpawnTick } from "../utils/TickUtils";

const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  DEFAULT_SPAWN_TICK_RANGE: { MIN: 300, MAX: 600 },
  INITIAL_TICKS_UNTIL_LAY: -1,
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

export class ResourceLaying {
  constructor() {
    this.handleLaying();
  }

  private handleLaying(): void {
    system.runInterval(() => {
      const currentTick = system.currentTick;
      for (const [id, { entity }] of ResourceChickens.chickenCache.entries()) {
        if (entity.typeId !== CONFIG.CHICKEN_TYPE_ID || !entity.isValid) continue;

        let nextLayAttempt = entity.getDynamicProperty("nextLayAttempt") as number | undefined;
        if (nextLayAttempt === undefined) {
          nextLayAttempt = CONFIG.INITIAL_TICKS_UNTIL_LAY;
          entity.setDynamicProperty("nextLayAttempt", nextLayAttempt);
        }

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
          entity.setDynamicProperty("nextLayAttempt", next);
          Logger.debug(`Set nextLayAttempt to ${next} for chicken ${id}`);
          continue;
        }

        if (currentTick < nextLayAttempt) continue;

        // Lay resource
        const itemId = getWeightedRandomItem(variantData.items);
        const itemStack = new ItemStack(itemId, 1);

        try {
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.dimension.spawnParticle("minecraft:crop_growth_emitter", entity.location);
          entity.dimension.playSound?.("mob.chicken.plop", entity.location, { volume: 1, pitch: 1 });
        } catch (e) {
          Logger.warn(`Failed to spawn item or play sound for chicken ${id}: ${e}`);
          continue;
        }

        // Set nextLayAttempt for the next cycle; reset if baby
        const isBaby = !!entity.getComponent?.("minecraft:is_baby");
        const next = isBaby ? CONFIG.INITIAL_TICKS_UNTIL_LAY : getNextLayTick(variantData);
        entity.setDynamicProperty("nextLayAttempt", next);
        Logger.debug(`Updated nextLayAttempt to ${next} for chicken ${id}`);
      }
    }, 1);
  }
}
