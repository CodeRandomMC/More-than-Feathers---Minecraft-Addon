import { Entity } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";

export enum ChickenVariantType {
  Base = 0,
  Stone = 1,
  Zombie = 2,
}

export interface ItemDrop {
  itemId: MinecraftItemTypes | string; // Using MinecraftItemTypes for item IDs
  weight: number;
}

export interface ChickenVariant {
  items: ItemDrop[];
}

export interface ChickenCacheEntry {
  entity: Entity;
  nextSpawnTick: number;
}

export const chickenVariants: Record<ChickenVariantType, ChickenVariant> = {
  [ChickenVariantType.Base]: {
    items: [
      { itemId: MinecraftItemTypes.Egg, weight: 50 },
      { itemId: MinecraftItemTypes.BlueEgg, weight: 25 },
      { itemId: MinecraftItemTypes.BrownEgg, weight: 25 },
    ],
  },
  [ChickenVariantType.Stone]: {
    items: [
      { itemId: MinecraftItemTypes.Stone, weight: 50 },
      { itemId: MinecraftItemTypes.Cobblestone, weight: 50 },
    ],
  },
  [ChickenVariantType.Zombie]: {
    items: [{ itemId: MinecraftItemTypes.RottenFlesh, weight: 100 }],
  },
};
