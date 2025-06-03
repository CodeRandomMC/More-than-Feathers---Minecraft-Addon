import { ItemStack, PlayerInteractWithEntityAfterEvent, world } from "@minecraft/server";

export class BaseChickenHandler {
  constructor() {
    this.handlePlayerInteraction();
  }

  private handlePlayerInteraction(): void {
    world.afterEvents.playerInteractWithEntity.subscribe((event: PlayerInteractWithEntityAfterEvent) => {
      const player = event.player;
      const entity = event.target;

      // Check if the entity is a chicken
      if (entity.typeId !== "minecraft:chicken") return;

      // Check if chcicken has the is_baby component
      const isBaby = entity.getComponent("minecraft:is_baby");

      // If the chicken is a baby, do not allow interaction
      if (isBaby) {
        return;
      }

      // Check if saturation is below 80 before feeding
      let saturation = (entity.getDynamicProperty("crs_mf:saturation") as number) || 0;
      if (saturation >= 80) {
        return;
      }

      if (event.itemStack && event.itemStack.typeId === "crs_mf:chicken_feed") {
        event.itemStack.amount--;
        const feedIndex = event.player
          .getComponent("minecraft:inventory")
          ?.container.find(new ItemStack("crs_mf:chicken_feed"));

        if (feedIndex !== undefined && feedIndex !== -1) {
          event.player
            .getComponent("minecraft:inventory")
            ?.container.setItem(feedIndex, new ItemStack("crs_mf:chicken_feed", event.itemStack.amount));
        }

        // Increase the chickens saturation property
        saturation = Math.min(100, Math.max(0, saturation + 10));
        entity.setDynamicProperty("crs_mf:saturation", saturation);
      }
    });
  }
}
