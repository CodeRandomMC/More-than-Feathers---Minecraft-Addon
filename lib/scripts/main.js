import { world, system, EntityInitializationCause } from "@minecraft/server";
function mainTick() {
    if (system.currentTick % 100 === 0) {
        world.sendMessage("Hello starter! Tick: " + system.currentTick);
    }
    system.run(mainTick);
}
system.run(mainTick);
world.afterEvents.entitySpawn.subscribe((eventData) => {
    if (eventData.cause === EntityInitializationCause.Born) {
        const entity = eventData.entity;
        world.sendMessage(`Entity spawned: ${entity.id} at ${entity.location.x}, ${entity.location.y}, ${entity.location.z}`);
    }
});
//# sourceMappingURL=main.js.map