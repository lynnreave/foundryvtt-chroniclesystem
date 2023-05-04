import SystemUtils from "../../../../util/systemUtils.js";
import { CharacterBase } from "../character-base.js";
import { ChronicleSystem } from "../../../system/ChronicleSystem.js";
import { getCommander } from "./helpers.js";
import {
    getAllTransformers,
    getTransformation
} from "../transformers.js";
import { CHARACTER_ATTR_CONSTANTS } from "../../../constants.js";
import { getData } from "../../../common.js";

/**
 * The Actor entity for handling warfare units.
 *
 * @category Actor
 */
export class Unit extends CharacterBase {

    calculateDerivedValues() {
        let data = getData(this);

        // commander
        data.commander = getCommander(this.getEmbeddedCollection("Item"));

        // "equipped" hardcoded entities
        // formation
        data.equippedFormation = ChronicleSystem.formations.find(
            (item) => item.rating === data.currentFormation
        );

        // base combat defense
        data.derivedStats.combatDefense.value = this.calcCombatDefense();
        data.derivedStats.combatDefense.total = data.derivedStats.combatDefense.value
            + parseInt(data.derivedStats.combatDefense.modifier);
        // discrete defense
        // v. fighting
        data.discreteDefenses.vFighting.value = data.derivedStats.combatDefense.total;
        data.discreteDefenses.vFighting.modifier = this.getTransformation("modifiers",
            ChronicleSystem.modifiersConstants.COMBAT_DEFENSE_FIGHTING,
            false, true
        ).total;
        data.discreteDefenses.vFighting.total = data.discreteDefenses.vFighting.value
            + data.discreteDefenses.vFighting.modifier;
        // v. marksmanship
        data.discreteDefenses.vMarksmanship.value = data.derivedStats.combatDefense.total;
        data.discreteDefenses.vMarksmanship.modifier = this.getTransformation("modifiers",
            ChronicleSystem.modifiersConstants.COMBAT_DEFENSE_MARKSMANSHIP,
            false, true
        ).total;
        data.discreteDefenses.vMarksmanship.total = data.discreteDefenses.vMarksmanship.value
            + data.discreteDefenses.vMarksmanship.modifier;

        data.derivedStats.health.value = this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.ENDURANCE)) * 3;
        data.derivedStats.health.total = data.derivedStats.health.value + parseInt(data.derivedStats.health.modifier);

        // disorganisation
        data.disorganisation.value = this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.ENDURANCE));
        data.disorganisation.total = data.disorganisation.value + parseInt(data.disorganisation.modifier);

        // num of orders received / turn
        data.ordersReceived.value = 5;
        data.ordersReceived.total = data.ordersReceived.value + parseInt(data.ordersReceived.modifier);

        // discipline
        data.discipline.modifier = this.getTransformation("modifiers",
            ChronicleSystem.modifiersConstants.DISCIPLINE, false, true
        ).total;
        data.discipline.total = data.discipline.value + data.discipline.modifier;
        data.discipline.totalWithOrders = data.discipline.total
            + parseInt(data.discipline.ordersReceivedModifier);

        // get damage resistance
        data.damageResistance = getTransformation(
            this, "modifiers", CHARACTER_ATTR_CONSTANTS.DAMAGE_TAKEN,
            false, true
        ).total;

        // get all active transformers
        data.transformers = getAllTransformers(this);
    }
}
