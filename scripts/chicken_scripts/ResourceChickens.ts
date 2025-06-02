import { Logger } from "../utils/CRSLogger";
import { ChickenCacheManager } from "./ChickenCacheManager";
import { ChickenCacheEntry } from "../chicken_data/ChickenData";
import { ResourceLaying } from "./ResourceLaying";

/**
 * ResourceChickens class holds the static cache of chicken data,
 * accessible to other modules in the mod.
 */
export class ResourceChickens {
  /**
   * Static map storing chicken cache entries, keyed by entity ID.
   * Accessible via ResourceChickens.chickenCache across modules.
   */
  static chickenCache = new Map<string, ChickenCacheEntry>();

  constructor() {
    Logger.setDebug(true);
    Logger.debug("Starting More than Feathers scripts...");
    new ChickenCacheManager();
    new ResourceLaying();
  }
}
