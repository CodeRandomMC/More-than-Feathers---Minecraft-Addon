import { Entity } from "@minecraft/server";
import { Logger } from "./CRSLogger";

export function getVariant(entity: Entity): number | undefined {
  const variantComponent = entity.getComponent("minecraft:variant");
  if (!variantComponent) {
    Logger.debug(`Entity ${entity.id} has no variant component, skipping.`);
    return undefined;
  }
  return variantComponent.value;
}