export const blockConfig = {
    "dirt": {
      id: 0,
      name: "Dirt",
      hardness: 0.5, // Block hardness (affects how long it takes to mine)
      blastResistance: 2.5, // Resistance to explosions
      textures: {
        default: "dirt_texture.png", // Default texture
        wet: "wet_dirt_texture.png", // Optional texture for wet state
      },
      toolRequired: false, // Whether a tool is required to mine the block
      drops: {
        item: "dirt", // What item is dropped when the block is mined
        quantity: 1, // Number of items dropped
        toolBonus: false, // Whether tools affect the number of drops
      },
      states: {
        default: "normal", // Default block state
        variants: ["grass", "wet", "muddy"], // Other possible states
      },
      isFlammable: false, // Whether the block can catch fire
      gravity: false, // Whether the block is affected by gravity (e.g., sand)
      isSolid: true, // Whether the block is solid (affects collision)
      isTransparent: false, // Whether the block is transparent
      lightLevel: 0, // Amount of light emitted by the block (0 for none)
      sounds: {
        place: "block.dirt.place", // Sound when the block is placed
        break: "block.dirt.break", // Sound when the block is broken
        step: "block.dirt.step", // Sound when walking on the block
      },
      interactions: {
        canBeTilled: true, // Whether the block can be tilled (e.g., into farmland)
        canGrowGrass: true, // Whether grass can grow on the block
      }
    },
  }
  