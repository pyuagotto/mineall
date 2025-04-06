// @ts-check
import { ItemStack, world, system, Block, Player, EquipmentSlot, GameMode } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "./lib/index.js";
import { getDropAmountWithFortune, getOreDropAmount, getOreDropItem, isAppropriateTool } from "./utils.js";
import config from "./config.js";
import toJson from "./toJson.js";

const directions = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }, // 東西南北
    { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 }, // 斜め
    { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 }, // 上下
    { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: -1 }, // 上の斜め
    { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 }, // 上の斜め
    { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 }, { x: 0, y: -1, z: 1 }, { x: 0, y: -1, z: -1 }, // 下の斜め
    { x: 1, y: -1, z: 1 }, { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: -1 }, { x: -1, y: -1, z: -1 } // 下の斜め
];


/**
 * 
 * @param {Block} block 
 * @param {String} blockId
 * @param {String} itemId 
 * @param {Player} player 
 * @param {ItemStack} itemStack
 * @param {Number} [fortuneLevel] 
 */
const searchAllDirections = function*(block, blockId, itemId, player, itemStack, fortuneLevel) {
    const queue = [block];
    let i = 0;
    while (queue.length > 0) {
        console.warn(`キューの長さ: ${queue.length}`);
        const currentBlock = queue.shift();

        if (!currentBlock) continue;

        for (const direction of directions) {
            const targetBlock = player.dimension.getBlock({
                x: currentBlock.location.x + direction.x,
                y: currentBlock.location.y + direction.y,
                z: currentBlock.location.z + direction.z
            });

            if (!targetBlock) continue;

            const isRedstoneOre = ["minecraft:lit_redstone_ore", "minecraft:redstone_ore"].includes(blockId) &&
                                  ["minecraft:lit_redstone_ore", "minecraft:redstone_ore"].includes(targetBlock.typeId);

            const isDeepslateRedstoneOre = ["minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"].includes(blockId) &&
                                           ["minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"].includes(targetBlock.typeId);

            if (isRedstoneOre || isDeepslateRedstoneOre || targetBlock.typeId === blockId) {
                targetBlock.setType("minecraft:air");

                let amount = getOreDropAmount(blockId);

                // シルクタッチの例外処理
                if (itemId.includes("_ore")) {
                    amount = 1;
                }

                let dropProbability = 1;

                //幸運の場合
                if(fortuneLevel){
                    if(isRedstoneOre || isDeepslateRedstoneOre){
                        amount = getDropAmountWithFortune(fortuneLevel, isRedstoneOre || isDeepslateRedstoneOre);
                        player.dimension.spawnItem(new ItemStack(itemId, amount), player.location);
                    }else{
                        dropProbability = getDropAmountWithFortune(fortuneLevel, isRedstoneOre || isDeepslateRedstoneOre);
                        player.dimension.spawnItem(new ItemStack(itemId, amount * dropProbability), player.location);
                    }
                }
                
                //幸運以外
                else{
                    player.dimension.spawnItem(new ItemStack(itemId, amount), player.location);
                }
                
                queue.push(targetBlock);
            }
        }

        yield;
    }
};

/**
 * ブロックを合計何ブロック掘るかを出力する関数
 * @param {Block} block 開始ブロック
 * @param {String} blockId 掘る対象のブロックID
 * @param {Player} player プレイヤー
 * @returns {Number} 掘ったブロックの合計数
 */
const countMinedBlocks = function(block, blockId, player) {
    const queue = [block];
    const processedBlocks = new Set(); // 探索済みブロックをセットで管理
    processedBlocks.add(JSON.stringify(block.location)); // ブロックの位置を文字列化して保存
    console.warn(`最初のブロック: ${toJson(block.location)}`);
    let blockCount = 0;
    let i = 0;
    while (queue.length > 0) {
        const currentBlock = queue.shift();

        if (!currentBlock) continue;

        blockCount++; // 掘ったブロックをカウント

        for (const direction of directions) {
            const targetBlock = player.dimension.getBlock({
                x: currentBlock.location.x + direction.x,
                y: currentBlock.location.y + direction.y,
                z: currentBlock.location.z + direction.z
            });

            if (!targetBlock) continue;

            const isRedstoneOre = ["minecraft:lit_redstone_ore", "minecraft:redstone_ore"].includes(blockId) &&
                                  ["minecraft:lit_redstone_ore", "minecraft:redstone_ore"].includes(targetBlock.typeId);

            const isDeepslateRedstoneOre = ["minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"].includes(blockId) &&
                                           ["minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"].includes(targetBlock.typeId);

            const targetLocationKey = JSON.stringify(targetBlock.location);

            // 未処理かつ同じブロックIDの場合のみキューに追加
            if (!processedBlocks.has(targetLocationKey) &&
                (isRedstoneOre || isDeepslateRedstoneOre || targetBlock.typeId === blockId)) {
                processedBlocks.add(targetLocationKey);
                queue.push(targetBlock);
            }
        }
    }

    console.warn(`処理の重複:${i}`)
    console.warn(`合計で掘ったブロック数: ${blockCount}`);
    return blockCount;
};

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
    const { block, player, itemStack } = ev;

    /*+if(player.getGameMode() !== GameMode.survival) {
        const vec = {x: 0, y: 0, z: 0};
        console.warn(JSON.stringify(vec) === JSON.stringify({x: 0, y: 0, z: 0}));
        
        return
    }*/
    //CutAll
    if(config.cutAll){
        const cutAll = player.getDynamicProperty("cutAll");

        if (cutAll && itemStack?.typeId.includes("_axe") && (block.typeId.includes("log") || block.typeId.includes("stem"))) {
            system.runJob(searchAllDirections(block, block.typeId, block.typeId, player, itemStack));
        }
    }
    
    //MineAll
    if(config.mineAll){
        const mineAll = player.getDynamicProperty("mineAll");

        if (mineAll && itemStack?.typeId.includes("_pickaxe")) {
            const enchantable = itemStack.getComponent("minecraft:enchantable");
    
            //鉱石
            if (block.typeId.includes("_ore")) {
                if(!isAppropriateTool(itemStack?.typeId, block.typeId)) return;

                //シルクタッチ
                if (enchantable?.hasEnchantment(MinecraftEnchantmentTypes.SilkTouch)) {
                    let itemId = "";
    
                    if(["minecraft:lit_redstone_ore", "minecraft:lit_deepslate_redstone_ore"].includes(block.typeId)) itemId = block.typeId.replace("lit_","");
                    else itemId = block.typeId;
                    system.runJob(searchAllDirections(block, block.typeId, itemId, player, itemStack));
                } 
                
                //シルクタッチ以外
                else {
                    const oreItem = getOreDropItem(block.typeId);
                    
                    if (oreItem) {
                        const fortuneLevel = enchantable?.getEnchantment(MinecraftEnchantmentTypes.Fortune)?.level;
                        system.runJob(searchAllDirections(block, block.typeId, oreItem, player, itemStack, fortuneLevel));
                    }
                }
            }
    
            //石系
            if (["minecraft:andesite", "minecraft:granite", "minecraft:diorite"].includes(block.typeId)) {
                countMinedBlocks(block, block.typeId, player);
                //test()
                //system.runJob(searchAllDirections(block, block.typeId, block.typeId, player, itemStack));
            }
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

    if(itemId === "minecraft:clock") {
        if(source.getGameMode() === GameMode.creative) source.setGameMode(GameMode.spectator);
    }

    if(!source.isSneaking) return;

    if (config.mineAll && itemId.includes("_pickaxe")) {
        if (source.getDynamicProperty("mineAll")) {
            source.setDynamicProperty("mineAll", false);
        } else {
            source.setDynamicProperty("mineAll", true);
        }

        source.playSound("random.click", { volume: 1 });
    }

    if (config.cutAll && itemId.includes("_axe")) {
        if (source.getDynamicProperty("cutAll")) {
            source.setDynamicProperty("cutAll", false);
        } else {
            source.setDynamicProperty("cutAll", true);
        }

        source.playSound("random.click", { volume: 1 });
    }
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const mainhand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);

        if (config.mineAll && mainhand?.typeId.includes("_pickaxe")) {
            if (player.getDynamicProperty("mineAll") === true) player.onScreenDisplay.setActionBar("§aMineAll§r:§6ON§r");
            else player.onScreenDisplay.setActionBar("§aMineAll§r:§0OFF§r");
        }

        if (config.cutAll && mainhand?.typeId.includes("_axe")) {
            if (player.getDynamicProperty("cutAll") === true) player.onScreenDisplay.setActionBar("§aCutAll§r:§6ON§r");
            else player.onScreenDisplay.setActionBar("§aCutAll§r:§0OFF§r");
        }
    }
});