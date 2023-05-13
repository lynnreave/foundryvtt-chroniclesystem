import { getData } from "../../common.js";
import {
    adjustFormulaByWeapon,
    getAbilityTestFormula
} from "../../roll/rolls.js";
import {
    getAbilityBySpecialty,
    getAbilityValue
} from "./abilities.js";
import SystemUtils from "../../../util/systemUtils.js";
import {
    CHARACTER_ATTR_CONSTANTS,
    KEY_CONSTANTS
} from "../../constants.js";
import { getTransformation } from "./transformers.js";

export function getWeaponTestDataForActor(actor, weapon) {
    /**
     * Update a weapon with test data based on the actor wielding it.
     * @param {Actor} actor: the actor document owner of the weapon.
     * @param {Weapon} weapon: the weapon document to be updated.
     */
    // get weapon data
    let weaponData = getData(weapon);

    // get weapon specialty (format "Ability:Specialty")
    let specialtyData = weaponData.specialty.split(":");
    if (specialtyData.length < 2) {
        return "";
    }
    let weaponAbility = specialtyData[0];
    let weaponSpecialty = specialtyData[1];

    // get formula by ability/specialty
    let formula = getAbilityTestFormula(actor, weaponAbility, weaponSpecialty);
    // adjust by weapon
    formula = adjustFormulaByWeapon(actor, formula, weapon);

    // get damage by ability
    weapon.damageValue = 0
    let matches = weaponData.damage.match('@([a-zA-Z]*)([-\+\/\*]*)([0-9]*)');
    if (matches) {
        if (matches.length === 4) {
            let damageAbility = matches[1];
            let abilityValue = getAbilityValue(actor, damageAbility);
            let operator = matches[2];
            let modifier = matches[3];
            weapon.damageValue = eval(`${abilityValue}${operator}${modifier}`);
        }
    }
    // handle powerful quality
    if (weaponData.isPowerful) {
        let [athletics, strength] =  getAbilityBySpecialty(
            actor,
            SystemUtils.localize(KEY_CONSTANTS.ATHLETICS),
            SystemUtils.localize(KEY_CONSTANTS.STRENGTH)
        );
        if (strength && strength.rating && strength.rating > 0) {
            weapon.damageValue += strength.rating;
        }
    }

    // get weapon damage modifiers
    weapon.damageValue += getTransformation(
        actor, "modifiers", CHARACTER_ATTR_CONSTANTS.BASE_WEAPON_DAMAGE
    ).total

    // min 1 damage
    weapon.damageValue = Math.max(weapon.damageValue, 1);

    // update weapon with test data
    weapon.formula = formula;
}

export function refreshEmbeddedActorData(actorItem) {
    /**
     * Refresh the embedded Actor item with their linked Actor.
     */
    // get the target actor
    let actorItemData = getData(actorItem);
    let targetActor = game.actors.get(actorItemData.targetId);
    // update actor item
    if (targetActor) {
        actorItem.name = targetActor.name;
        actorItem.img = targetActor.img;
    }
}
