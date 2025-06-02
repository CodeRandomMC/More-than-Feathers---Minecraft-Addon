import { EntityVariantComponent, ItemStack, system, world } from "@minecraft/server";
import { ChickenCacheEntry, chickenVariants, ChickenVariantType, ItemDrop } from "./ChickenData";

const chickenCache: Map<string, ChickenCacheEntry> = new Map<string, ChickenCacheEntry>();

function getWeightedRandomItem(items: ItemDrop[]): string {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) return entry.itemId;
  }
  return items[0].itemId;
}

function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) {
    throw new Error("Invalid range for random spawn tick");
  }

  return system.currentTick + Math.floor(Math.random() * (max - min + 1)) + min;
}

function setupChickenCacheEvents() {
  // Listen for entity load events to populate the cache
  world.afterEvents.entityLoad.subscribe((event) => {
    const entity = event.entity;
    if (entity.typeId !== "crs_mf:resource_chicken") return;
    if (entity.hasComponent("minecraft:is_baby")) return;

    // Add to cache with a random next spawn tick
    chickenCache.set(entity.id, { entity, nextSpawnTick: getNextRandomSpawnTick(300, 600) });
  });

  world.beforeEvents.entityRemove.subscribe((event) => {
    const entity = event.removedEntity;
    if (entity.typeId !== "crs_mf:resource_chicken") return;

    // Remove from cache
    chickenCache.delete(entity.id);
  });
}

function handleChickenLaying() {
  // Use system and run every tick to batch process the chickens
  system.runInterval(() => {
    const currentTick = system.currentTick;

    // Check cache size
    if (chickenCache.size === 0) return;
    for (const [id, entry] of chickenCache.entries()) {
      const { entity, nextSpawnTick } = entry;

      if (currentTick < nextSpawnTick) continue; // Skip if not time to lay

      // Get variant and items
      const variantComponent: EntityVariantComponent | undefined = entity.getComponent("minecraft:variant");

      if (!variantComponent) {
        console.warn(`Entity ${entity.id} has no variant component, skipping.`);
        continue;
      }

      const variant = variantComponent.value as ChickenVariantType;
      const variantData = chickenVariants[variant];

      if (!variantData) {
        console.warn(`Unknown variant ${variant} for entity ${entity.id}, skipping.`);
        continue;
      }

      const itemId = getWeightedRandomItem(variantData.items);
      const itemStack = new ItemStack(itemId, 1);

      // spawn item
      try {
        entity.dimension.spawnItem(itemStack, entity.location);
        entity.dimension.playSound("plop", entity.location);
      } catch (e) {
        console.warn(`Failed to spawn item for chicken ${id}: ${e}`);
        chickenCache.delete(id); // Remove invalid entity
        continue;
      }

      // Schedule next spawn
      entry.nextSpawnTick = getNextRandomSpawnTick(300, 600);
    }
  }, 1);
}

export class ResourceLayingManager {
  constructor() {
    setupChickenCacheEvents();
    handleChickenLaying();
  }
}
