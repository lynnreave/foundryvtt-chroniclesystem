import { ItemSheetChronicle } from "../item-sheet-chronicle.js";
import { COMBAT_ACTION_TYPES } from "../../selections.js";

/**
 * A sheet for handling action combat item types.
 */
export class ActionCombatSheet extends ItemSheetChronicle {

    getData() {
        const data = super.getData();
        data.combatActionTypesChoices = {};
        for (let i = 0; i < COMBAT_ACTION_TYPES.length; i++) {
            data.combatActionTypesChoices[i] = COMBAT_ACTION_TYPES[i].name;
        }
        return data;
    }
}
