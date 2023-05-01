import { CHARACTER_DISPOSITIONS } from "../../../selections.js";
import {
    addTransformer,
    removeTransformer,
    saveTransformers,
    updateTempTransformers
} from "../transformers.js";
import { CHARACTER_ATTR_CONSTANTS, KEY_CONSTANTS } from "../../../constants.js";
import { getData } from "../../../common.js";

export function refreshDisposition(character) {
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