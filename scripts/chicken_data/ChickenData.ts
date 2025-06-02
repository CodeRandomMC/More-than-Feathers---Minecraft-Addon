import { Entity } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { getVariant } from "../utils/EntityUtils";
import { ChickenVariants } from "./ChickenVariants";

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
}

export enum ChickenVariantType {
  Base = 0,
  Stone = 1,
  Zombie = 2,
}

export function getChickenVariant(entity: Entity): ChickenVariantType {
  if (entity.typeId !== "crs_mf:resource_chicken") {
    throw new Error(`Entity ${entity.id} is not a resource chicken.`);
  }
  const minecraftVariant = getVariant(entity);

  if (minecraftVariant === undefined) {
    throw new Error(`Entity ${entity.id} has no variant, defaulting to Base.`);
  }
  return minecraftVariant as ChickenVariantType; // Cast to ChickenVariantType
}

export function getChickenVariantData(entity: Entity): ChickenVariant {
  const chickenVariant = getChickenVariant(entity);
  return ChickenVariants[chickenVariant] || ChickenVariants[ChickenVariantType.Base];
}
