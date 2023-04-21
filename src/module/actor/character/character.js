import LOGGER from "../../../util/logger.js";
import SystemUtils from "../../../util/systemUtils.js";
import { CharacterBase } from "./character-base.js";
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import { CSConstants } from "../../system/csConstants.js";

/**
 * The Actor entity for handling characters.
 * This currently includes both player and non-player characters.
 *
 * @category Actor
 */
export class Character extends CharacterBase {

    calculateDerivedValues() {
        let data = this.getData();
        data.derivedStats.intrigueDefense.value = this.calcIntrigueDefense();
        data.derivedStats.intrigueDefense.total = data.derivedStats.intrigueDefense.value + parseInt(data.derivedStats.intrigueDefense.modifier);
        data.derivedStats.composure.value = this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.WILL)) * 3;
        data.derivedStats.composure.total = data.derivedStats.composure.value + parseInt(data.derivedStats.composure.modifier);
        data.derivedStats.combatDefense.value = this.calcCombatDefense();


        data.derivedStats.combatDefense.total = data.derivedStats.combatDefense.value + parseInt(data.derivedStats.combatDefense.modifier);
        data.derivedStats.health.value = this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.ENDURANCE)) * 3;
        data.derivedStats.health.total = data.derivedStats.health.value + parseInt(data.derivedStats.health.modifier);
        data.derivedStats.frustration.value = this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.WILL));
        data.derivedStats.frustration.total = data.derivedStats.frustration.value + parseInt(data.derivedStats.frustration.modifier);
        data.derivedStats.fatigue.value = this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.ENDURANCE));
        data.derivedStats.fatigue.total = data.derivedStats.fatigue.value + parseInt(data.derivedStats.fatigue.modifier);
    }

    getMaxInjuries() {
        return this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.ENDURANCE));
    }

    getMaxWounds() {
        return this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.ENDURANCE));
    }

    calcIntrigueDefense() {
        return this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.AWARENESS)) +
            this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.CUNNING)) +
            this.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.STATUS));
    }
}
