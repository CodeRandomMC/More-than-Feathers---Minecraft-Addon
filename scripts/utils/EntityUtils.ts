import { Entity } from "@minecraft/server";

export function getVariant(entity: Entity): number | undefined {
  const variantComponent = entity.getComponent("minecraft:variant");
  return variantComponent?.value as number | undefined;
}
