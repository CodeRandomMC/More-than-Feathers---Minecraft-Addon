/**
 * Data types and logic for resource chicken variants and drops.
 * @module chicken_data/ChickenData
 */
import { Entity } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { getVariant } from "../utils/EntityUtils";
import { ChickenVariants } from "./ChickenVariants";

/**
 * Represents an item drop with weight and optional amount range.
 */
export interface ItemDrop {
  itemId: MinecraftItemTypes | string;
  weight: number;
  amountMin?: number;
  amountMax?: number;
}

/**
 * Represents a chicken variant's drop and spawn data.
 */
export interface ChickenVariant {
  items: ItemDrop[];
  minSpawnTick?: number;
  maxSpawnTick?: number;
}

/**
 * Stores and manages all data for a single chicken entity.
 */
export class ChickenData {
  private entity: Entity;
  public variant: ChickenVariantType;
  public items: ItemDrop[];
  public minSpawnTick: number;
  public maxSpawnTick: number;
  public isBaby: boolean;
  public saturation: number;
  public nextLayAttempt: number;
  public health: number | undefined;
  public maxHealth: number | undefined;

  /**
   * Initializes chicken data from an entity.
   * @param entity The chicken entity.
   */
  constructor(entity: Entity) {
    this.entity = entity;
    const variantData = getChickenVariantData(entity);
    this.variant = getChickenVariant(entity);
    this.items = variantData.items.map((item) => ({
      itemId: item.itemId,
      weight: item.weight,
      amountMin: item.amountMin ?? 1,
      amountMax: item.amountMax ?? 1,
    }));
    this.minSpawnTick = variantData.minSpawnTick ?? 120 * 20;
    this.maxSpawnTick = variantData.maxSpawnTick ?? 240 * 20;
    this.isBaby = entity.getComponent("minecraft:is_baby")?.isValid ?? false;
    this.saturation = (entity.getDynamicProperty("crs_mf:saturation") as number) || 0;
    this.nextLayAttempt = (entity.getDynamicProperty("crs_mf:next_lay_attempt") as number) || 0;
    const healthComp = entity.getComponent("minecraft:health");
    this.health = healthComp ? (healthComp as any).current : undefined;
    this.maxHealth = healthComp ? (healthComp as any).value : undefined;
  }

  /**
   * Sets the chicken's saturation value.
   */
  setSaturation(value: number) {
    this.entity.setDynamicProperty("crs_mf:saturation", value);
    this.saturation = value;
  }

  /**
   * Sets the chicken's health value.
   */
  setHealth(value: number) {
    const healthComp = this.entity.getComponent("minecraft:health");
    if (healthComp) {
      (healthComp as any).current = value;
      this.health = value;
    }
  }

  /**
   * Sets the next lay attempt tick.
   */
  setNextLayAttempt(value: number) {
    this.entity.setDynamicProperty("crs_mf:next_lay_attempt", value);
    this.nextLayAttempt = value;
  }

  /**
   * Heals the chicken by a given amount.
   */
  heal(amount: number) {
    const healthComp = this.entity.getComponent("minecraft:health");
    if (healthComp && this.health !== undefined) {
      const newHealth = Math.min((healthComp as any).value, this.health + amount);
      (healthComp as any).current = newHealth;
      this.health = newHealth;
    }
  }

  /**
   * Damages the chicken by a given amount.
   */
  damage(amount: number) {
    const healthComp = this.entity.getComponent("minecraft:health");
    if (healthComp && this.health !== undefined) {
      const newHealth = Math.max(0, this.health - amount);
      (healthComp as any).current = newHealth;
      this.health = newHealth;
    }
  }

  /**
   * Refreshes all properties from the entity (useful after external changes).
   */
  refresh() {
    const variantData = getChickenVariantData(this.entity);
    this.variant = getChickenVariant(this.entity);
    this.items = variantData.items.map((item) => ({
      itemId: item.itemId,
      weight: item.weight,
      amountMin: item.amountMin ?? 1,
      amountMax: item.amountMax ?? 1,
    }));
    this.minSpawnTick = variantData.minSpawnTick ?? 120 * 20;
    this.maxSpawnTick = variantData.maxSpawnTick ?? 240 * 20;
    this.isBaby = this.entity.getComponent("minecraft:is_baby")?.isValid ?? false;
    this.saturation = (this.entity.getDynamicProperty("crs_mf:saturation") as number) || 0;
    this.nextLayAttempt = (this.entity.getDynamicProperty("crs_mf:next_lay_attempt") as number) || 0;
    const healthComp = this.entity.getComponent("minecraft:health");
    this.health = healthComp ? (healthComp as any).current : undefined;
    this.maxHealth = healthComp ? (healthComp as any).value : undefined;
  }

  /**
   * Handles the resource laying for this chicken.
   * Spawns the item, particle, and sound, and resets the next lay attempt.
   */
  layResources() {
    if (this.isBaby) return;
    // Pick a random item to lay
    const getWeightedRandomItem = require("../utils/RandomUtils").getWeightedRandomItem;
    const getNextRandomSpawnTick = require("../utils/TickUtils").getNextRandomSpawnTick;
    const Logger = require("../utils/CRSLogger").Logger;
    const itemId = getWeightedRandomItem(this.items, (item: any) => item.itemId);
    const ItemStack = require("@minecraft/server").ItemStack;
    const itemStack = new ItemStack(itemId, 1);
    try {
      this.entity.dimension.spawnItem(itemStack, this.entity.location);
      this.entity.dimension.spawnParticle("minecraft:crop_growth_emitter", this.entity.location);
      this.entity.dimension.playSound?.("mob.chicken.plop", this.entity.location, { volume: 1, pitch: 1 });
    } catch (e) {
      Logger.debug(
        `Failed to spawn item for chicken ${this.entity.id} at ${JSON.stringify(this.entity.location)}: ${e}`
      );
    }
    // Reset next lay attempt
    const next = getNextRandomSpawnTick(this.minSpawnTick, this.maxSpawnTick);
    this.setNextLayAttempt(next);
    Logger.debug(`Reset nextLayAttempt countdown to ${next} for chicken ${this.entity.id}`);
  }

  /**
   * Feeds the chicken: increases saturation, heals, and plays effects.
   * Returns true if feeding was successful.
   */
  feed(amount: number = 100, healAmount: number = 2): boolean {
    if (this.isBaby) return false;
    if (this.saturation >= 100) return false;
    // Increase saturation
    this.setSaturation(Math.min(100, this.saturation + amount));
    // Heal if not at max health
    if (this.health !== undefined && this.maxHealth !== undefined && this.health < this.maxHealth) {
      this.heal(healAmount);
    }
    // Play eat sound and particle
    try {
      this.entity.dimension.spawnParticle?.("crs_mf:chicken_eat", this.entity.location);
      this.entity.dimension.playSound?.("mob.chicken.eat", this.entity.location, { volume: 1, pitch: 1 });
    } catch (e) {
      // Ignore errors for effects
    }
    return true;
  }
}

/**
 * Enum for all chicken variant types.
 */
export enum ChickenVariantType {
  Base = 0,
  Stone = 1,
  Zombie = 2,
}

/**
 * Gets the chicken variant type for an entity.
 * @param entity The chicken entity.
 * @returns The ChickenVariantType.
 */
export function getChickenVariant(entity: Entity): ChickenVariantType {
  if (entity.typeId !== "crs_mf:resource_chicken") {
    throw new Error(`Entity ${entity.id} is not a resource chicken.`);
  }
  const minecraftVariant = getVariant(entity);
  if (minecraftVariant === undefined) {
    throw new Error(`Entity ${entity.id} has no variant, defaulting to Base.`);
  }
  return minecraftVariant as ChickenVariantType;
}

/**
 * Gets the variant data for a chicken entity.
 * @param entity The chicken entity.
 * @returns The ChickenVariant data object.
 */
export function getChickenVariantData(entity: Entity): ChickenVariant {
  const chickenVariant = getChickenVariant(entity);
  return ChickenVariants[chickenVariant] || ChickenVariants[ChickenVariantType.Base];
}

/**
 * Gets a ChickenData instance for an entity.
 * @param entity The chicken entity.
 * @returns The ChickenData instance.
 */
export function getChickenData(entity: Entity): ChickenData {
  return new ChickenData(entity);
}
