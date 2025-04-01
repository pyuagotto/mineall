//@ts-check
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