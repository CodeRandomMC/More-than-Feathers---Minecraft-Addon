/**
 * Handles player interaction and feeding logic for resource chickens.
 * @module chicken_scripts/BaseChickenHandler
 */
import { EquipmentSlot, ItemStack, PlayerInteractWithEntityAfterEvent, world } from "@minecraft/server";
import { Logger } from "../utils/CRSLogger";
import { getChickenData, ChickenData } from "../chicken_data/ChickenData";

Logger.debug("BaseChickenHandler script loaded.");

/**
 * Handles player interactions with resource chickens, including feeding.
 */
export class BaseChickenHandler {
  constructor() {
    Logger.debug("BaseChickenHandler initialized.");
    this.setupFeedChickenEvent();
    Logger.debug("Feed chicken event handler set up.");
  }

  /**
   * Subscribes to the playerInteractWithEntity event to handle feeding.
   */
  private setupFeedChickenEvent() {
    world.afterEvents.playerInteractWithEntity.subscribe((event: PlayerInteractWithEntityAfterEvent) => {
      const player = event.player;
      const entity = event.target;

      let chickenData: ChickenData | undefined = undefined;
      if (entity.typeId === "crs_mf:resource_chicken") {
        try {
          chickenData = getChickenData(entity);
        } catch (e) {
          Logger.warn(`Failed to get chicken data: ${e}`);
        }
      }
      if (!chickenData) return;
      if (chickenData.isBaby) {
        Logger.debug("Tried to feed a baby chicken. Feeding is only allowed for adults.");
        return;
      }
      if (chickenData.saturation !== undefined && chickenData.saturation >= 100) {
        Logger.debug("Chicken is already fully sated. No feeding needed.");
        return;
      }

      if (event.itemStack && event.itemStack.typeId === "crs_mf:chicken_feed") {
        Logger.debug(`Player ${player.name} fed a chicken with chicken feed.`);
        event.itemStack.amount = Math.max(0, event.itemStack.amount - 1);
        const feedIndex = player
          .getComponent("minecraft:inventory")
          ?.container.find(new ItemStack("crs_mf:chicken_feed"));
        if (feedIndex !== undefined && feedIndex !== -1) {
          if (event.itemStack.amount > 0) {
            player.getComponent("minecraft:inventory")?.container.setItem(feedIndex, event.itemStack);
          } else {
            player.getComponent("minecraft:inventory")?.container.setItem(feedIndex, undefined);
          }
        }
        chickenData.setSaturation(100);
      }
    });
  }
}
