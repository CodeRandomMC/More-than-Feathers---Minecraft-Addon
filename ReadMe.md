# More than Feathers: Minecraft Bedrock Add-on Documentation (Version 1.0)

## Overview
**Add-on Name**: More than Feathers  
**Description**: A Minecraft Bedrock add-on that introduces **Resource Chickens**, a new mob with multiple variants that drop unique resources instead of feathers or raw chicken. Players can cross-breed chickens using seeds to unlock new variants, use special methods (e.g., potions, fireballs) to create rare chickens, and maintain a saturation mechanic to ensure resource production. Resources can be farmed using hoppers and dispensers for automation. Future versions will add resource eggs, a Feeder Block, and blocks for egg processing.  
**Purpose**: To enhance Minecraft’s farming and resource-gathering with interactive, automation-friendly chicken-based mechanics.  
**Target Audience**: Minecraft Bedrock players who enjoy farming, automation, and mob interaction.

## Core Features (Version 1.0)

### 1. Resource Chicken Mob
- A single mob type with multiple variants, each dropping unique resources instead of feathers or raw chicken.
- Variants are visually distinct (e.g., unique feather colors, textures, particle effects).
- Spawns naturally in the Overworld, rarer than regular chickens (1/10 chance vs. vanilla chickens).

### 2. Saturation Mechanic
- Resource Chickens have a **saturation** property (0–100 scale).
- Must have saturation >75 to lay resources (every 5–7 minutes, like egg-laying).
- Feeding seeds increases saturation by 25 per seed (via right-click or dispenser).
- Saturation decreases by 10 every 5 minutes if unfed.
- Unfed chickens (saturation ≤75) stop producing resources until fed.
- Visuals: Hungry chickens (≤75) emit gray smoke particles; sated chickens (>75) emit happy villager-like particles.
- Hungry chickens move slower (0.8x speed).

### 3. Cross-Breeding Mechanic
- Breed two Resource Chickens using vanilla seeds to produce a chick with a chance of a new variant.
- Breeding requires saturation >75 for both parents.
- Outcomes depend on parent variants:
  - Common (60%): Iron, Gold Chickens.
  - Uncommon (30%): Redstone, Lapis Chickens.
  - Rare (10%): Diamond, Emerald Chickens.
- Cooldown: 5 minutes (vanilla mechanic).

### 4. Special Variant Transformations
- Specific actions transform Resource Chickens:
  - **Zombie Chicken**: Splash with Potion of Poison or Weakness (hostile, drops rotten flesh, rare iron ingots).
  - **Lava Chicken**: Expose to lava or use **Molten Essence** (drops magma cream, rare lava bucket).
  - **Blaze Chicken**: Hit a Lava Chicken with a fireball (drops blaze rods, rare glowstone).
- Transformations are rare and require specific conditions.

### 5. Resource Drops
- Each variant lays a resource item (5–7 minutes) when saturation >75.
- Drops:
  - **Iron Chicken**: Iron nuggets (100%), iron ingots (5%).
  - **Gold Chicken**: Gold nuggets (100%), gold ingots (5%).
  - **Redstone Chicken**: Redstone dust (100%).
  - **Lapis Chicken**: Lapis lazuli (100%).
  - **Diamond Chicken**: Diamond shards (100%, new item), diamonds (2%).
  - **Emerald Chicken**: Emeralds (5%, very rare).
  - **Zombie Chicken**: Rotten flesh (100%), iron ingots (5%).
  - **Lava Chicken**: Magma cream (100%), lava bucket (2%, single-use).
  - **Blaze Chicken**: Blaze rods (100%), glowstone dust (10%).

### 6. Automation
- Players can farm resources using vanilla hoppers and dispensers:
  - **Setup**: Confine chickens in a pen with a hopper below to collect resources into a chest.
  - **Feeding**: Dispensers fire seeds (on a redstone clock, e.g., every 5 minutes) to maintain saturation >75.
- Keeps automation “Minecrafty” by using vanilla mechanics.

### 7. Behavior
- Most Resource Chickens are passive, roaming and clucking.
- Hostile variants (e.g., Zombie Chicken) attack players/mobs within a 5-block radius (4 hearts health, 2 damage).

## Planned Features (Version 2.0)

### 1. Resource Eggs
- Resource Chickens lay variant-specific eggs (e.g., Zombie Chicken Egg) when saturation >75, replacing direct resource drops.
- Eggs can be:
  - Thrown to spawn a baby Resource Chicken (50% chance) or drop a variant resource (50%, e.g., rotten flesh).
  - Collected by hoppers.
  - Fired from dispensers for automation (produces babies or resources).
- Eggs stack up to 16.

### 2. Feeder Block
- Crafted with 4 planks + 1 iron ingot + 1 redstone.
- Holds up to 64 seeds in its inventory.
- Environment sensor detects Resource Chickens within a 5-block radius.
- Consumes 1 seed per chicken every 5 minutes, increasing saturation by 25.
- Visual: Emits seed particles when feeding.
- Automation: Hoppers load seeds into the Feeder Block.

### 3. Egg Incubator
- Crafted with 4 iron ingots + 1 redstone + 4 planks.
- Hatches resource eggs into baby Resource Chickens (100% chance, 2–3 minutes).
- Visual: Glowing animation, clucking sounds.

### 4. Egg Pasteurizer
- Crafted with 4 iron ingots + 1 blaze powder + 4 cobblestone.
- Converts resource eggs into variant resources (e.g., Zombie Chicken Egg → rotten flesh or iron ingot).
- Processing time: 30 seconds per egg, follows variant drop rates.
- Automation: Hoppers input eggs and collect outputs.

### 5. Advanced Automation
- Setup example:
  - Feeder Block auto-feeds chickens (seeds via hopper).
  - Hopper collects resource eggs.
  - Eggs funneled to a dispenser (redstone clock) to fire eggs, producing babies or resources, collected by another hopper.
  - Alternatively, eggs sent to Pasteurizer for resource conversion, with hoppers collecting outputs.

## Mechanics

### Saturation System
- **Saturation Property**:
  - Range: 0–100 (starts at 50 when spawned).
  - Feeding seeds: +25 saturation per seed (right-click or dispenser).
  - Decay: -10 saturation every 5 minutes if unfed.
  - Threshold: >75 to lay resources (Version 1.0) or eggs (Version 2.0).
  - Visuals: Gray smoke (≤75), happy particles (>75).
  - Hungry chickens move slower (0.8x speed).
- **Impact**: Ties resource production to seed farming, encouraging active farm management.

### Cross-Breeding System
- Feed two Resource Chickens seeds (saturation >75) to enter love mode.
- Offspring variant:
  - Example: Iron Chicken + Gold Chicken → 60% Iron/Gold, 30% Redstone/Lapis, 10% Diamond/Emerald.
- Cooldown: 5 minutes.

### Transformation Mechanics
- **Zombie Chicken**:
  - Condition: Splash with Potion of Poison or Weakness.
  - Effect: Transforms (smoke particles), hostile (4 hearts, 2 damage).
  - Drops: Rotten flesh (100%), iron ingot (5%).
- **Lava Chicken**:
  - Condition: Expose to lava or **Molten Essence** (crafted: 1 magma cream + 1 blaze powder).
  - Effect: Fiery texture, immune to lava/fire.
  - Drops: Magma cream (100%), lava bucket (2%).
- **Blaze Chicken**:
  - Condition: Hit Lava Chicken with a fireball (Blaze, dispenser, or new item).
  - Effect: Blaze-like particles, emits light (level 8).
  - Drops: Blaze rods (100%), glowstone dust (10%).

### Variant List
| Variant           | Drops                              | Rarity    | Behavior   | How to Obtain                     |
|-------------------|------------------------------------|-----------|------------|-----------------------------------|
| Iron Chicken      | Iron nuggets, rare iron ingots     | Common    | Passive    | Cross-breeding or natural spawn   |
| Gold Chicken      | Gold nuggets, rare gold ingots     | Common    | Passive    | Cross-breeding or natural spawn   |
| Redstone Chicken  | Redstone dust                     | Uncommon  | Passive    | Cross-breeding (Iron + Gold)      |
| Lapis Chicken     | Lapis lazuli                      | Uncommon  | Passive    | Cross-breeding (Iron + Gold)      |
| Diamond Chicken   | Diamond shards, rare diamonds      | Rare      | Passive    | Cross-breeding (rare chance)      |
| Emerald Chicken   | Emeralds (very rare)              | Rare      | Passive    | Cross-breeding (rare chance)      |
| Zombie Chicken    | Rotten flesh, rare iron ingots    | Special   | Hostile    | Potion of Poison/Weakness         |
| Lava Chicken      | Magma cream, rare lava bucket     | Special   | Passive    | Lava or Molten Essence            |
| Blaze Chicken     | Blaze rods, rare glowstone        | Special   | Passive    | Fireball on Lava Chicken          |

## Technical Notes
- **Mob Variants**: Use Bedrock’s entity component system for textures, drops, behaviors.
- **Saturation**: Dynamic property in entity JSON, with timers for decay and feeding.
- **Automation**: Leverages vanilla hoppers/dispensers (Version 1.0); future Feeder Block uses environment sensor.
- **New Items**:
  - **Diamond Shards**: 9 shards craft into 1 diamond.
  - **Molten Essence**: Crafted with 1 magma cream + 1 blaze powder.
- **Balancing**:
  - Drop rates prevent economy disruption (e.g., 2% for diamonds).
  - Saturation ties production to seed farming.
  - Automation requires investment (hoppers, redstone, seeds).
- **Future Blocks**: Feeder Block, Incubator, Pasteurizer use custom block entities.

## Future Ideas
- Resource eggs for advanced automation.
- Feeder Block support for wheat, carrots.
- Nether/ venomous variants (e.g., Quartz Chicken, Enderman Chicken).
- Achievements: “Auto-Cluck” for a fully automated farm.
- Structures: “Resource Coop” with pre-spawned chickens.

## Next Steps
- Finalize saturation mechanics (decay rate, seed boost).
- Define automation setups for Version 1.0 (hopper/dispenser layouts).
- Plan Feeder Block and resource egg automation for Version 2.0.
- Describe variant appearances (e.g., “Zombie Chicken: tattered green feathers”).
- Test balance for drop rates and saturation costs.