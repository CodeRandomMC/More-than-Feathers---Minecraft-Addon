import { Logger } from "../utils/CRSLogger";
import { ChickenCacheEntry } from "../chicken_data/ChickenData";
import { ResourceLaying } from "./ResourceLaying";
import { BaseChickenHandler } from "./BaseChickenHandler";

/**
 * ResourceChickens class holds the static cache of chicken data,
 * accessible to other modules in the mod.
 */
export class ResourceChickens {
  constructor() {
    Logger.setDebug(true);
    Logger.debug("Starting More than Feathers scripts...");
    new BaseChickenHandler();
    Logger.debug("BaseChickenHandler initialized.");
    new ResourceLaying();
    Logger.debug("ResourceLaying initialized.");
  }
}
