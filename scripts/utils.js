//@ts-check
// ツールと鉱石のレベルマッピング
const toolLevels = {
    "minecraft:wooden_pickaxe": 1,
    "minecraft:gold_pickaxe": 1,
    "minecraft:stone_pickaxe": 2,
    "minecraft:iron_pickaxe": 3,
    "minecraft:diamond_pickaxe": 3,
    "minecraft:netherite_pickaxe": 3
};

const oreLevels = {
    "minecraft:coal_ore": 1,
    "minecraft:deepslate_coal_ore": 1,
    "minecraft:nether_gold_ore": 1,
    "minecraft:quartz_ore": 1,
    "minecraft:copper_ore": 2,
    "minecraft:deepslate_copper_ore": 2,
    "minecraft:iron_ore": 2,
    "minecraft:deepslate_iron_ore": 2,
    "minecraft:lapis_ore": 2,
    "minecraft:deepslate_lapis_ore": 2,
    "minecraft:gold_ore": 3,
    "minecraft:deepslate_gold_ore": 3,
    "minecraft:diamond_ore": 3,
    "minecraft:deepslate_diamond_ore": 3,
    "minecraft:emerald_ore": 3,
    "minecraft:deepslate_emerald_ore": 3,
    "minecraft:lit_redstone_ore": 3,
    "minecraft:redstone_ore": 3,
    "minecraft:lit_deepslate_redstone_ore": 3,
    "minecraft:deepslate_redstone_ore": 3
};

/**
 * ツールのレベルと鉱石のレベルを比較し、適切かどうかを判定する関数
 * @param {String} toolId ツールのID
 * @param {String} oreId 鉱石のID
 * @returns {boolean} ツールが鉱石を採掘できる場合はtrue、それ以外はfalse
 */
export const isAppropriateTool = function(toolId, oreId) {
    const toolLevel = toolLevels[toolId] || 0;
    const oreLevel = oreLevels[oreId] || 0;
    return toolLevel >= oreLevel;
};

/**
 * 
 * @param {Number} level 
 * @param {boolean} [isRedstone]
 * @returns {Number}
 */
export const getDropAmountWithFortune = function(level, isRedstone) {
    if (isRedstone) {
        const base = 4;
        const maxExtra = level + 2;
        return Math.floor(Math.random() * maxExtra) + base;
    }

    const maxProbability = level + 2;
    const probability = Math.floor(Math.random() * maxProbability);
    return Math.max(level + 1 - probability, 1);
};


/**
 * 
 * @param {String} blockType 
 * @returns {string | null}
 */
export const getOreDropItem = function(blockType) {
    switch (blockType) {
        case "minecraft:diamond_ore":
        case "minecraft:deepslate_diamond_ore":
            return "minecraft:diamond";

        case "minecraft:emerald_ore":
        case "minecraft:deepslate_emerald_ore":
            return "minecraft:emerald";

        case "minecraft:gold_ore":
        case "minecraft:deepslate_gold_ore":
            return "minecraft:raw_gold";

        case "minecraft:iron_ore":
        case "minecraft:deepslate_iron_ore":
            return "minecraft:raw_iron";

        case "minecraft:lit_redstone_ore":
        case "minecraft:redstone_ore":
        case "minecraft:lit_deepslate_redstone_ore":
        case "minecraft:deepslate_redstone_ore":
            return "minecraft:redstone";

        case "minecraft:lapis_ore":
        case "minecraft:deepslate_lapis_ore":
            return "minecraft:lapis_lazuli";

        case "minecraft:coal_ore":
        case "minecraft:deepslate_coal_ore":
            return "minecraft:coal";

        case "minecraft:copper_ore":
        case "minecraft:deepslate_copper_ore":
            return "minecraft:raw_copper";

        case "minecraft:quartz_ore":
            return "minecraft:quartz";

        case "minecraft:nether_gold_ore":
            return "minecraft:gold_nugget";

        default:
            return null;
    }
};


/**
 * 
 * @param {String} blockType 
 * @returns {number}
 */
export const getOreDropAmount = function(blockType) {
    switch (blockType) {
        case "minecraft:lit_redstone_ore":
        case "minecraft:redstone_ore":
        case "minecraft:lit_deepslate_redstone_ore":
        case "minecraft:deepslate_redstone_ore":
            return Math.floor(Math.random() * 2) + 4;

        case "minecraft:lapis_ore":
        case "minecraft:deepslate_lapis_ore":
            return Math.floor(Math.random() * 6) + 4;

        case "minecraft:copper_ore":
        case "minecraft:deepslate_copper_ore":
            return Math.floor(Math.random() * 4) + 2;

        case "minecraft:nether_gold_ore":
            return Math.floor(Math.random() * 5) + 2;

        default:
            return 1;
    }
};