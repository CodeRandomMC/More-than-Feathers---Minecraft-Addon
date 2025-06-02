import { Entity } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { getVariant } from "../utils/EntityUtils";

export interface ItemDrop {
  itemId: MinecraftItemTypes | string; // Using MinecraftItemTypes for item IDs
  weight: number;
  amountMin?: number; // Optional minimum amount, default is 1
  amountMax?: number; // Optional maximum amount, default is 1
}

export interface ChickenVariant {
  items: ItemDrop[];
  minSpawnTick?: number;
  maxSpawnTick?: number;
}

export interface ChickenCacheEntry {
  entity: Entity;
  nextSpawnTick: number;
}

export enum ChickenVariantType {
  Base = 0,
  Stone = 1,
  Zombie = 2,
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
      { itemId: MinecraftItemTypes.Stone, weight: 25 },
      { itemId: MinecraftItemTypes.Cobblestone, weight: 75 },
    ],
  },
  [ChickenVariantType.Zombie]: {
    items: [{ itemId: MinecraftItemTypes.RottenFlesh, weight: 100 }],
  },
};

export function getChickenVariant(entity: Entity): ChickenVariantType {
  if (entity.typeId !== "crs_mf:resource_chicken") {
    throw new Error(`Entity ${entity.id} is not a resource chicken.`);
  }
  const minecraftVariant = getVariant(entity);

  if (minecraftVariant === undefined) {
    throw new Error(`Entity ${entity.id} has no variant, defaulting to Base.`);
  } else {
    return minecraftVariant as ChickenVariantType; // Cast to ChickenVariantType
  }
}

export function getChickenVariantData(entity: Entity): ChickenVariant {
  const chickenVariant = getChickenVariant(entity);
  return chickenVariants[chickenVariant] || chickenVariants[ChickenVariantType.Base]; // Fallback to Base if not found
}
