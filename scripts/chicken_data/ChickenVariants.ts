import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { ChickenVariantType, ChickenVariant } from "./ChickenData";

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
      // Rotten flesh as the primary drop
      { itemId: MinecraftItemTypes.RottenFlesh, weight: 90 },
      // Carrot and potato as common drops
      { itemId: MinecraftItemTypes.Carrot, weight: 3 },
      { itemId: MinecraftItemTypes.Potato, weight: 3 },
      // iron ingots as a rare drop
      { itemId: MinecraftItemTypes.IronIngot, weight: 2 },
      // zombie head as a very rare drop
      { itemId: MinecraftItemTypes.PoisonousPotato, weight: 1 },
      { itemId: MinecraftItemTypes.ZombieHead, weight: 1 },
    ],
    minSpawnTick: 30 * 20,
    maxSpawnTick: 60 * 20,
  },
};
