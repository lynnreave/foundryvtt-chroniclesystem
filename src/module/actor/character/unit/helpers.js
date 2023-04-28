import {
    addTransformer,
    removeTransformer, saveTransformers,
    updateTempTransformers
} from "../transformers.js"
import {
    CHARACTER_ATTR_CONSTANTS,
    EQUIPPED_CONSTANTS,
    KEY_CONSTANTS
} from "../../../constants.js";
import {
    UNIT_STATUSES,
    UNIT_FACINGS,
    UNIT_FORMATIONS
} from "../../../selections.js";
import { getData } from "../../../common.js";

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
            unit, "poolMods", CHARACTER_ATTR_CONSTANTS.FIGHTING, KEY_CONSTANTS.HEROES,
            1, false
        )
        addTransformer(
            unit, "poolMods", CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP, KEY_CONSTANTS.HEROES,
            1, false
        )
    // else, remove them
    } else {
        removeTransformer(unit, "modifiers", CHARACTER_ATTR_CONSTANTS.DISCIPLINE, KEY_CONSTANTS.HEROES)
        removeTransformer(unit, "poolMods", CHARACTER_ATTR_CONSTANTS.FIGHTING, KEY_CONSTANTS.HEROES)
        removeTransformer(unit, "poolMods", CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP, KEY_CONSTANTS.HEROES)
    }
}

export function updateDisorganisation(unit, newValue) {
    /**
     * Update the current disorganisation of a unit Actor.
     * @param {object} unit: a unit Actor.
     * @param {number} newValue: the new disorganisation value.
     */
    // save temp transformers to actor
    updateTempTransformers(unit);
    // get current disorganisation (cannot be greater than total allowed)
    let data = getData(unit);
    let value = Math.max(
        Math.min(
            parseInt(newValue),
            data.disorganisation.total
        ), 0
    );
    // update transformers
    if (value !== 0) {
        addTransformer(
            unit,
            "poolMods",
            CHARACTER_ATTR_CONSTANTS.ALL,
            KEY_CONSTANTS.DISORGANISATION,
            -value,
            false
        )
        addTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DISCIPLINE,
            KEY_CONSTANTS.DISORGANISATION,
            value*3,
            false
        )
    } else {
        removeTransformer(
            unit,
            "poolMods",
            CHARACTER_ATTR_CONSTANTS.ALL,
            KEY_CONSTANTS.DISORGANISATION
        )
        removeTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DISCIPLINE,
            KEY_CONSTANTS.DISORGANISATION
        )
    }
    saveTransformers(unit);
    // update unit current facing
    unit.update({"system.disorganisation.current": value});
}

export function updateFacing(unit, facingId) {
    /**
     * Update the facing of a unit Actor.
     * @param {object} unit: a unit Actor.
     * @param {number} facingId: the index of the unit facing in {UNIT_FACINGS}.
     */
    updateTempTransformers(unit);
    // get unit facing
    let facing = UNIT_FACINGS[facingId];
    if (!facing) { return; }
    // update transformers
    // fighting test dice pool
    if (facing.testDiceModifier !== 0) {
        addTransformer(
            unit,
            "poolMods",
            CHARACTER_ATTR_CONSTANTS.FIGHTING,
            KEY_CONSTANTS.FACING,
            facing.testDiceModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "poolMods",
            CHARACTER_ATTR_CONSTANTS.FIGHTING,
            KEY_CONSTANTS.FACING
        )
    }
    // fighting bonus dice
    if (facing.bonusDiceModifier !== 0) {
        addTransformer(
            unit,
            "bonuses",
            CHARACTER_ATTR_CONSTANTS.FIGHTING,
            KEY_CONSTANTS.FACING,
            facing.bonusDiceModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "bonuses",
            CHARACTER_ATTR_CONSTANTS.FIGHTING,
            KEY_CONSTANTS.FACING
        )
    }
    saveTransformers(unit);
    // update unit current facing
    unit.update({"system.currentFacing": facingId});
}

export function updateFormation(unit, formationId) {
    /**
     * Update the formation of a unit Actor.
     * @param {object} unit: a unit Actor.
     * @param {number} formationId: the index of the unit formation in {UNIT_FORMATIONS}.
     */
    updateTempTransformers(unit);
    // get unit facing
    let formation = UNIT_FORMATIONS[formationId];
    if (!formation) { return; }
    // update transformers
    // discipline
    if (formation.disciplineModifier !== 0) {
        addTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DISCIPLINE,
            KEY_CONSTANTS.FORMATION,
            formation.disciplineModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DISCIPLINE,
            KEY_CONSTANTS.FORMATION
        )
    }
    // fighting combat defense
    if (formation.fightingDefenseModifier !== 0) {
        addTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE_FIGHTING,
            KEY_CONSTANTS.FORMATION,
            formation.fightingDefenseModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE_FIGHTING,
            KEY_CONSTANTS.FORMATION
        )
    }
    // marksmanship combat defense
    if (formation.marksmanshipDefenseModifier !== 0) {
        addTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE_MARKSMANSHIP,
            KEY_CONSTANTS.FORMATION,
            formation.marksmanshipDefenseModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE_MARKSMANSHIP,
            KEY_CONSTANTS.FORMATION
        )
    }
    // movement
    if (formation.movementModifier !== 0) {
        addTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.MOVEMENT,
            KEY_CONSTANTS.FORMATION,
            formation.movementModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.MOVEMENT,
            KEY_CONSTANTS.FORMATION
        )
    }
    // fighting test dice pool
    if (formation.testDiceModifier !== 0) {
        addTransformer(
            unit,
            "poolMods",
            CHARACTER_ATTR_CONSTANTS.FIGHTING,
            KEY_CONSTANTS.FORMATION,
            formation.testDiceModifier,
            false
        )
    } else {
        removeTransformer(
            unit,
            "poolMods",
            CHARACTER_ATTR_CONSTANTS.FIGHTING,
            KEY_CONSTANTS.FORMATION
        )
    }
    saveTransformers(unit);
    // update unit current formation
    unit.update({"system.currentFormation": formationId});
}

export function updateOrdersReceived(unit, newValue) {
    /**
     * Update the current orders received of a unit Actor.
     * @param {object} unit: a unit Actor.
     * @param {number} newValue: the new orders received value.
     */
    // save temp transformers to actor
    updateTempTransformers(unit);
    // get current orders received (cannot be greater than total allowed)
    let data = getData(unit);
    let value = Math.max(
        Math.min(
            parseInt(newValue),
            data.ordersReceived.total
        ), 0
    );
    let mod = Math.max(
        Math.min(
            parseInt(newValue),
            data.ordersReceived.modifier
        ), 0
    );
    // update transformers
    if (value > 0) {
        mod += value*3
    }
    // update unit current facing
    unit.update({
        "system.ordersReceived.current": value,
        "system.discipline.ordersReceivedModifier": mod
    });
}

export function updateStatus(unit, statusId) {
    /**
     * Update the status of a unit Actor.
     * @param {object} unit: a unit Actor.
     * @param {number} statusId: the index of the unit status in {UNIT_STATUSES}.
     */
    updateTempTransformers(unit);
    // get unit status
    let unitStatus = UNIT_STATUSES[statusId];
    if (!unitStatus) { return; }
    saveTransformers(unit);
    // update actor current status
    unit.update({"system.currentStatus": statusId});
}
