import { CHARACTER_DISPOSITIONS } from "../../../selections.js";
import {
    addTransformer, getTransformation,
    removeTransformer,
    saveTransformers,
    updateTempTransformers
} from "../transformers.js";
import { CHARACTER_ATTR_CONSTANTS, KEY_CONSTANTS } from "../../../constants.js";
import { getData } from "../../../common.js";
import { getAbilityValue } from "../abilities.js";
import SystemUtils from "../../../../util/systemUtils.js";

export function calculateIntrigueDefense(character) {
    /**
     * Calculate a character's intrigue defense.
     * @param {Actor} character: a character Actor.
     * @return {number}: the total intrigue defense.
     */
    let intrigueDefense = 0;
    // get character data
    const data = getData(character);
    // total from abilities
    if (!data.ignoreIntrigueDefenseAwareness) {
        intrigueDefense += getAbilityValue(character, SystemUtils.localize(KEY_CONSTANTS.AWARENESS));
    }
    if (!data.ignoreIntrigueDefenseCunning) {
        intrigueDefense += getAbilityValue(character, SystemUtils.localize(KEY_CONSTANTS.CUNNING));
    }
    if (!data.ignoreIntrigueDefenseStatus) {
        intrigueDefense += getAbilityValue(character, SystemUtils.localize(KEY_CONSTANTS.STATUS));
    }
    // add modifiers
    let mod = getTransformation(
        character, "modifiers", CHARACTER_ATTR_CONSTANTS.INTRIGUE_DEFENSE
    ).total;
    intrigueDefense += mod;
    // minimum 1
    intrigueDefense = Math.max(intrigueDefense, 1);
    // return
    return intrigueDefense;
}

export function refreshDisposition(character) {
    /**
     * Refresh the disposition of a character Actor.
     * @param {Actor} character: a character Actor.
     */
    // get disposition
    let currentDisposition = getData(character).currentDisposition;
    let disposition = CHARACTER_DISPOSITIONS[parseInt(currentDisposition)];
    if (!disposition) { return false; }
    // update transformers
    // composure resistance
    addTransformer(
        character,
        "modifiers",
        CHARACTER_ATTR_CONSTANTS.COMPOSURE_RESISTANCE,
        KEY_CONSTANTS.DISPOSITION,
        disposition.rating,
        false
    );
    // persuasion
    if (disposition.persuasionModifier !== 0) {
        addTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.PERSUASION,
            KEY_CONSTANTS.DISPOSITION,
            disposition.persuasionModifier,
            false
        );
    } else {
        removeTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.PERSUASION,
            KEY_CONSTANTS.DISPOSITION
        );
    }
    // deception
    if (disposition.deceptionModifier !== 0) {
        addTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DECEPTION,
            KEY_CONSTANTS.DISPOSITION,
            disposition.deceptionModifier,
            false
        );
    } else {
        removeTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DECEPTION,
            KEY_CONSTANTS.DISPOSITION
        );
    }
}

export function updateDisposition(character, dispositionId) {
    /**
     * Update the disposition of a character Actor.
     * TODO: update intrigue damage resistance.
     * @param {Actor} character: a character Actor.
     * @param {number} dispositionId: the index of the disposition in {CHARACTER_DISPOSITIONS}.
     */
    updateTempTransformers(character);
    // update current disposition
    character.update({"system.currentDisposition": dispositionId});
    // refresh transformers
    refreshDisposition(character);
    // save
    saveTransformers(character);
}

export function updateWeaponDefendingState(character, weaponId, isDefending) {
    /**
     * Update the target weapon to specified isDefending value.
     * @param {Actor} character: the character Actor object.
     * @param {string} weaponId: the id of the owned weapon document.
     * @param {boolean} isDefending: which state to update the weapon to.
     */
    isDefending = (String(isDefending) === "true")
    // find weapon
    let characterData = getData(character);
    let weapon = characterData.owned.weapons.find((weapon) => weapon._id === weaponId);
    // update isDefending
    if (weapon) {
        let weaponData = getData(weapon);
        weaponData.isDefending = isDefending;
        weapon.data = weaponData;
        let weaponDefense = parseInt((weaponData.defense));
        if (isDefending === true && weaponDefense !== 0) {
            addTransformer(
                character, "modifiers",
                CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE, weapon._id, weaponDefense,
                true, true
            );
        } else {
            removeTransformer(
                character, "modifiers", CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE, weapon._id, true
            )
        }
    }
    return weapon;
}
