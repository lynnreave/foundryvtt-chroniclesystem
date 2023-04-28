import LOGGER from "../../../../util/logger.js";
import { CHARACTER_DISPOSITIONS } from "../../../selections.js";
import {
    addTransformer,
    removeTransformer,
    saveTransformers,
    updateTempTransformers
} from "../transformers.js";
import { CHARACTER_ATTR_CONSTANTS, KEY_CONSTANTS } from "../../../constants.js";

export function updateDisposition(character, dispositionId) {
    /**
     * Update the disposition of a character Actor.
     * @param {object} character: a character Actor.
     * @param {number} dispositionId: the index of the disposition in {CHARACTER_DISPOSITIONS}.
     */
    updateTempTransformers(character);
    // get disposition
    let disposition = CHARACTER_DISPOSITIONS[dispositionId];
    if (!disposition) { return; }
    // update transformers
    // persuasion
    if (disposition.persuasionModifier !== 0) {
        addTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.PERSUASION,
            KEY_CONSTANTS.DISPOSITION,
            disposition.persuasionModifier,
            false
        )
    } else {
        removeTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.PERSUASION,
            KEY_CONSTANTS.DISPOSITION
        )
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
        )
    } else {
        removeTransformer(
            character,
            "modifiers",
            CHARACTER_ATTR_CONSTANTS.DECEPTION,
            KEY_CONSTANTS.DISPOSITION
        )
    }
    saveTransformers(character);
    // update actor current disposition
    character.update({"system.currentDisposition": dispositionId});
}