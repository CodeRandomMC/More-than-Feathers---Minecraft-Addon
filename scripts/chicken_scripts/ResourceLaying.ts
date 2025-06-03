/**
 * Handles the resource laying logic for resource chickens.
 * @module chicken_scripts/ResourceLaying
 */
import { system, ItemStack, Entity, world } from "@minecraft/server";
import { getChickenData, ChickenData } from "../chicken_data/ChickenData";
import { Logger } from "../utils/CRSLogger";
import { getWeightedRandomItem, hashString } from "../utils/RandomUtils";
import { getNextRandomSpawnTick } from "../utils/TickUtils";

const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  LAY_CHECK_INTERVAL: 10,
} as const;

/**
 * Class responsible for handling the periodic resource laying of chickens.
 */
export class ResourceLaying {
  constructor() {
    this.handleLaying();
    Logger.debug("ResourceLaying initialized.");
  }

  /**
   * Periodically checks all resource chickens and handles their resource laying logic.
   */
  private handleLaying(): void {
    system.runInterval(() => {
      const currentTick = system.currentTick;
      const overworld = world.getDimension("overworld");
      const chickens = overworld.getEntities({ type: CONFIG.CHICKEN_TYPE_ID });
      for (const entity of chickens) {
        if (!entity.isValid) continue;

        const id = entity.id ?? (entity as any).uniqueId ?? JSON.stringify(entity.location);
        const offset = hashString(id) % CONFIG.LAY_CHECK_INTERVAL;
        if ((system.currentTick + offset) % CONFIG.LAY_CHECK_INTERVAL !== 0) continue;

        let chickenData: ChickenData | undefined = undefined;
        try {
          chickenData = getChickenData(entity);
        } catch (e) {
          Logger.warn(`Failed to get chicken data for chicken ${id}: ${e}`);
          continue;
        }

        let countdown = chickenData.nextLayAttempt;
        if (typeof countdown !== "number" || countdown <= 0) {
          const next = getNextRandomSpawnTick(chickenData.minSpawnTick, chickenData.maxSpawnTick);
          chickenData.setNextLayAttempt(next);
          Logger.debug(`Set nextLayAttempt countdown to ${next} for chicken ${id}`);
          continue;
        }
        if (chickenData.isBaby) continue;
        countdown -= CONFIG.LAY_CHECK_INTERVAL;
        if (countdown > 0) {
          chickenData.setNextLayAttempt(countdown);
          continue;
        }
        const itemId = getWeightedRandomItem(chickenData.items, (item) => item.itemId);
        const itemStack = new ItemStack(itemId, 1);
        try {
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.dimension.spawnParticle("minecraft:crop_growth_emitter", entity.location);
          entity.dimension.playSound?.("mob.chicken.plop", entity.location, { volume: 1, pitch: 1 });
        } catch (e) {
          Logger.debug(`Failed to spawn item for chicken ${id} at ${JSON.stringify(entity.location)}: ${e}`);
        }
        const next = getNextRandomSpawnTick(chickenData.minSpawnTick, chickenData.maxSpawnTick);
        chickenData.setNextLayAttempt(next);
        Logger.debug(`Reset nextLayAttempt countdown to ${next} for chicken ${id}`);
      }
    }, CONFIG.LAY_CHECK_INTERVAL);
  }
}
