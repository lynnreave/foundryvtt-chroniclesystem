import {
    addTransformer,
    removeTransformer,
    saveTransformers,
    updateTempTransformers
} from "../transformers.js"
import {
    CHARACTER_ATTR_CONSTANTS,
    EQUIPPED_CONSTANTS,
    KEY_CONSTANTS
} from "../../../constants.js";

export function getCommander(items) {
    /**
     * Return the "equipped" commander.
     *
     * @param {Array} items: an array of embedded items from an Actor.
     * @returns {object}: the commander object.
     */

    return items.find(
        (item) => item.type === 'hero' && item.system.equipped === EQUIPPED_CONSTANTS.COMMANDER
    ) || null;
}

export function getAttachedHeroes(items) {
    /**
     * Return all attached (non-commander) heroes.
     *
     * @param {Array} items: an array of embedded items from an Actor.
     * @returns {Array}: an array of attached heroes.
     */

    return items.filter(
        (item) => item.type === 'hero' && (
            !item.system || (!item.system.equipped || item.system.equipped !== EQUIPPED_CONSTANTS.COMMANDER)
        )
    );
}

export function updateAttachedHeroesEffects(unit) {
    /**
     * Update or refresh the effects of any attached heroes to a unit Actor.
     *
     * @param {object} unit: a unit Actor.
     */

    // update temp transformers
    updateTempTransformers(unit);

    // get embedded items
    let items = unit.getEmbeddedCollection('Item')

    // apply transformers if at least 1 hero attached
    let heroes = getAttachedHeroes(items);
    if (heroes.length > 0) {
        addTransformer(
            unit, "modifiers", CHARACTER_ATTR_CONSTANTS.DISCIPLINE, KEY_CONSTANTS.HEROES,
            -3, false
        )
        addTransformer(
            unit, "penalties", CHARACTER_ATTR_CONSTANTS.FIGHTING, KEY_CONSTANTS.HEROES,
            -1, false
        )
        addTransformer(
            unit, "penalties", CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP, KEY_CONSTANTS.HEROES,
            -1, false
        )
    // else, remove them
    } else {
        removeTransformer(unit, "modifiers", CHARACTER_ATTR_CONSTANTS.DISCIPLINE, KEY_CONSTANTS.HEROES)
        removeTransformer(unit, "penalties", CHARACTER_ATTR_CONSTANTS.FIGHTING, KEY_CONSTANTS.HEROES)
        removeTransformer(unit, "penalties", CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP, KEY_CONSTANTS.HEROES)
    }
}

