// @ts-check
import { ItemStack, world, system, Block, Player, EquipmentSlot, EnchantmentType, EnchantmentTypes } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "./lib/index.js";

/**
 * 
 * @param {Block} block 
 * @param {String} blockId
 * @param {String} itemId 
 * @param {Number} amount 
 * @param {Player} player 
 * @param {Number} [fortuneLevel] 
 */
const searchAllDirections = function*(block, blockId, itemId, amount, player, fortuneLevel) {
    const directions = [
        { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }, // 東西南北
        { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 }, // 斜め
        { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 }, // 上下
        { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: -1 }, // 上の斜め
        { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 }, // 上の斜め
        { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 }, { x: 0, y: -1, z: 1 }, { x: 0, y: -1, z: -1 }, // 下の斜め
        { x: 1, y: -1, z: 1 }, { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: -1 }, { x: -1, y: -1, z: -1 } // 下の斜め
    ];

    const queue = [block];

    while (queue.length > 0) {
        const currentBlock = queue.shift();

        if (currentBlock) {
            for (const direction of directions) {
                const targetBlock = player.dimension.getBlock({
                    x: currentBlock.location.x + direction.x,
                    y: currentBlock.location.y + direction.y,
                    z: currentBlock.location.z + direction.z
                });

                // 条件に一致するブロックを判定
                const isRedstoneOre = targetBlock && ["minecraft:lit_redstone_ore", "minecraft:redstone_ore"].includes(blockId) &&
                                      ["minecraft:lit_redstone_ore", "minecraft:redstone_ore"].includes(targetBlock.typeId);

                const isDeepslateRedstoneOre = targetBlock && ["minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"].includes(blockId) &&
                                               ["minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"].includes(targetBlock.typeId);

                if (isRedstoneOre || isDeepslateRedstoneOre || targetBlock?.typeId === blockId) {
                    targetBlock?.setType("minecraft:air");
                    const dropAmount = fortuneLevel ? getDropAmountWithFortune(fortuneLevel) : 1;
                    player.dimension.spawnItem(new ItemStack(itemId, amount * dropAmount), player.location);
                    if(targetBlock) queue.push(targetBlock);
                }
            }
        }

        yield;
    }
};

const getDropAmountWithFortune = function(level) {
    const maxProbability = level + 2;
    const probability = Math.floor(Math.random() * maxProbability);
    return Math.max(level + 1 - probability, 1);
};

const getOreDropDetails = function(blockType) {
    switch (blockType) {
        case "minecraft:diamond_ore":
        case "minecraft:deepslate_diamond_ore":
            return { itemId: "minecraft:diamond", amount: 1 };

        case "minecraft:emerald_ore":
        case "minecraft:deepslate_emerald_ore":
            return { itemId: "minecraft:emerald", amount: 1 };

        case "minecraft:gold_ore":
        case "minecraft:deepslate_gold_ore":
            return { itemId: "minecraft:raw_gold", amount: 1 };

        case "minecraft:iron_ore":
        case "minecraft:deepslate_iron_ore":
            return { itemId: "minecraft:raw_iron", amount: 1 };

        case "minecraft:lit_redstone_ore":
        case "minecraft:redstone_ore":
        case "minecraft:lit_deepslate_redstone_ore":
        case "minecraft:deepslate_redstone_ore":
            return { itemId: "minecraft:redstone", amount: Math.floor(Math.random() * 2) + 4 };

        case "minecraft:lapis_ore":
        case "minecraft:deepslate_lapis_ore":
            return { itemId: "minecraft:lapis_lazuli", amount: Math.floor(Math.random() * 6) + 4 };

        case "minecraft:coal_ore":
        case "minecraft:deepslate_coal_ore":
            return { itemId: "minecraft:coal", amount: 1 };

        case "minecraft:copper_ore":
        case "minecraft:deepslate_copper_ore":
            return { itemId: "minecraft:raw_copper", amount: Math.floor(Math.random() * 4) + 2 };

        default:
            return null;
    }
};

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
    const { block, player, itemStack } = ev;

    if (player.getDynamicProperty("cutAll") && itemStack?.typeId.includes("_axe") && (block.typeId.includes("log") || block.typeId.includes("stem"))) {
        system.runJob(searchAllDirections(block, block.typeId, block.typeId, 1, player));
    }

    if (player.getDynamicProperty("mineAll") && itemStack?.typeId.includes("_pickaxe")) {
        const enchantable = itemStack.getComponent("minecraft:enchantable");

        if (block.typeId.includes("ore")) {
            if (enchantable?.hasEnchantment(MinecraftEnchantmentTypes.SilkTouch)) {
                let itemId = "";

                if(["minecraft:lit_redstone_ore", "minecraft:lit_deepslate_redstone_ore"].includes(block.typeId)) itemId = block.typeId.replace("lit_","");
                else itemId = block.typeId;
                system.runJob(searchAllDirections(block, block.typeId, itemId, 1, player));
            } else {
                const oreDetails = getOreDropDetails(block.typeId);
                if (oreDetails) {
                    const fortuneLevel = enchantable?.getEnchantment(MinecraftEnchantmentTypes.Fortune)?.level;
                    system.runJob(searchAllDirections(block, block.typeId, oreDetails.itemId, oreDetails.amount, player, fortuneLevel));
                }
            }
        }

        if (["minecraft:andesite", "minecraft:granite", "minecraft:diorite"].includes(block.typeId)) {
            system.runJob(searchAllDirections(block, block.typeId, block.typeId, 1, player));
        }
    }
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const mainhand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);

        if (mainhand?.typeId.includes("_pickaxe")) {
            if (player.getDynamicProperty("mineAll") === true) player.onScreenDisplay.setActionBar("§aMineAll§r:§6ON§r");
            else player.onScreenDisplay.setActionBar("§aMineAll§r:§0OFF§r");
        }

        if (mainhand?.typeId.includes("_axe")) {
            if (player.getDynamicProperty("cutAll") === true) player.onScreenDisplay.setActionBar("§aCutAll§r:§6ON§r");
            else player.onScreenDisplay.setActionBar("§aCutAll§r:§0OFF§r");
        }
    }
});

world.afterEvents.playerSpawn.subscribe((ev) => {
    const { player } = ev;

    if (player.getDynamicProperty("mineAll") === undefined) {
        player.setDynamicProperty("mineAll", false);
    }

    if (player.getDynamicProperty("cutAll") === undefined) {
        player.setDynamicProperty("cutAll", false);
    }
});

world.afterEvents.itemUse.subscribe((ev) => {
    const { itemStack, source } = ev;
    const itemId = itemStack.typeId;

    if (itemId.includes("_pickaxe")) {
        if (source.getDynamicProperty("mineAll")) {
            source.setDynamicProperty("mineAll", false);
        } else {
            source.setDynamicProperty("mineAll", true);
        }

        source.playSound("random.click", { volume: 1 });
    }

    if (itemId.includes("_axe")) {
        if (source.getDynamicProperty("cutAll")) {
            source.setDynamicProperty("cutAll", false);
        } else {
            source.setDynamicProperty("cutAll", true);
        }

        source.playSound("random.click", { volume: 1 });
    }
});