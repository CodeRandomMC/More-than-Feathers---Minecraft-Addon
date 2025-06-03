/**
 * Initializes all resource chicken logic and event handlers.
 * @module chicken_scripts/ResourceChickens
 */
import { Logger } from "../utils/CRSLogger";
import { ResourceLaying } from "./ResourceLaying";
import { BaseChickenHandler } from "./BaseChickenHandler";

/**
 * Main entry point for resource chicken logic. Sets up all handlers.
 */
export class ResourceChickens {
  constructor() {
    Logger.setDebug(true);
    Logger.debug("Starting More than Feathers scripts...");
    new BaseChickenHandler();
    new ResourceLaying();
  }
}
