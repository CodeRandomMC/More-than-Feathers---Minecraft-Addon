/**
 * Utility functions for working with Minecraft entity variants.
 * @module utils/EntityUtils
 */
import { Entity } from "@minecraft/server";

/**
 * Gets the variant value from an entity's variant component.
 * @param entity The entity to query.
 * @returns The variant number, or undefined if not present.
 */
export function getVariant(entity: Entity): number | undefined {
  const variantComponent = entity.getComponent("minecraft:variant");
  return variantComponent?.value as number | undefined;
}
