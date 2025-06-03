/**
 * Chicken variant data for all resource chicken types.
 * @module chicken_data/ChickenVariants
 */
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { ChickenVariantType, ChickenVariant } from "./ChickenData";

/**
 * Maps each ChickenVariantType to its drop and spawn data.
 */
export const ChickenVariants: Record<ChickenVariantType, ChickenVariant> = {
  [ChickenVariantType.Base]: {
    items: [
      { itemId: MinecraftItemTypes.Egg, weight: 50 },
      { itemId: MinecraftItemTypes.BlueEgg, weight: 25 },
      { itemId: MinecraftItemTypes.BrownEgg, weight: 25 },
    ],
    minSpawnTick: 60 * 20,
    maxSpawnTick: 120 * 20,
  },
  [ChickenVariantType.Stone]: {
    items: [
      { itemId: MinecraftItemTypes.Stone, weight: 25 },
      { itemId: MinecraftItemTypes.Cobblestone, weight: 75 },
    ],
    minSpawnTick: 30 * 20,
    maxSpawnTick: 60 * 20,
  },
  [ChickenVariantType.Zombie]: {
    items: [
      { itemId: MinecraftItemTypes.RottenFlesh, weight: 90 },
      { itemId: MinecraftItemTypes.Carrot, weight: 3 },
      { itemId: MinecraftItemTypes.Potato, weight: 3 },
      { itemId: MinecraftItemTypes.IronIngot, weight: 2 },
      { itemId: MinecraftItemTypes.PoisonousPotato, weight: 1 },
      { itemId: MinecraftItemTypes.ZombieHead, weight: 1 },
    ],
    minSpawnTick: 30 * 20,
    maxSpawnTick: 60 * 20,
  },
};
