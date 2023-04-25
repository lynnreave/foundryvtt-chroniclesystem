import { DiceRollFormula } from "./dice-roll-formula.js";
import {
    getAbility,
    getAbilityBySpecialty
} from "../actor/character/abilities.js";
import { getTransformation } from "../actor/character/transformers.js";
import { getData } from "../common.js";

export function getAbilityTestFormula(actor, abilityName, specialtyName = null) {
    /**
     * Get the ability test formula for an Actor.
     *
     * @param {object} actor: an Actor object.
     * @param {string} abilityName: the name of the ability.
     * @param {string} specialtyName: the name of the ability specialty.
     * @returns {DiceRollFormula}.
     */

    console.assert(actor, "actor is invalid!");
    console.assert(abilityName, "ability name is invalid!");

    // some transformers require the name in lowercase to match CHARACTER_ATTR_CONSTANTS ?
    // TODO: determine if this is really necessary vs. just using abilityName
    let abilityNameLowerCase = abilityName.toLowerCase();

    // get ability (and specialty, if specified) from actor
    let ability;
    let specialty;
    if (specialtyName === null) {
        [ability, specialty] = getAbility(actor, abilityName);
    } else {
        [ability, specialty] = getAbilityBySpecialty(actor, abilityName, specialtyName);
        if (ability === undefined) {
            [ability, specialty] = getAbility(actor, abilityName);
        }
    }

    // blank DiceRollFormula object to build on
    let formula = new DiceRollFormula();

    // get specialy bonuses (if they exist)
    let specValue = (specialty && specialty.rating) ? specialty.rating : 0;
    let specModifier = (specialty && specialty.modifier) ? specialty.modifier : 0;

    // set re-roll at base 0
    formula.reRoll = 0;

    // get all transformers to ability
    let poolMods = getTransformation(
        actor, "poolMods", abilityNameLowerCase, false, true
    );
    let penalties = getTransformation(
        actor, "penalties", abilityNameLowerCase, false, true
    );
    let bonuses = getTransformation(
        actor, "bonuses", abilityNameLowerCase, false, true
    )
    let modifiers = getTransformation(
        actor, "modifiers", abilityNameLowerCase,false, true
    );

    // get ability data (or use default for non-existent ability)
    let abilityData = ability ? getData(ability) : {rating: 2, modifier: 0};

    // update formula dice values w/ ability data and transformations
    // test dice pool
    formula.pool = abilityData.rating + poolMods.total;
    // test dice pool penalties
    formula.dicePenalty = penalties.total;
    // bonus dice
    formula.bonusDice = specValue + bonuses.total;
    // roll modifier
    formula.modifier = abilityData.modifier + specModifier + modifiers.total;

    // return
    return formula;
}

export function getFormula(rollDef, actor) {
    /**
     * Get the dice formula for an actor by roll definition
     *
     * @param {Array} rollData: an array containing:
     *  - {string}: the type of roll.
     *  - {string}: the name of the source (e.g., ability, item, etc.).
     *  - {string}: the formula values split by "|" OR the name of an ability for specialty test type.
     * @param {object} actor: an Actor object.
     * @returns {DiceRollFormula}.
     *
     * TODO: in rollData[2], the final value (reRoll) is ignored. Is this a bug?
     */

    // get blank formula
    let formula = new DiceRollFormula();

    switch (rollDef[0]){
        case 'ability':
            formula = getAbilityTestFormula(actor, rollDef[1]);
            break;
        case 'specialty':
            formula = getAbilityTestFormula(actor, rollDef[2], rollDef[1]);
            break;
        case 'weapon-test':
            formula = DiceRollFormula.fromStr(rollDef[2]);
            break;
        case 'persuasion':
        case 'deception':
        case 'formula':
            formula = DiceRollFormula.fromStr(rollDef[2]);
            break;
    }

    // handle negative penalty
    // TODO: don't overload penalty; change to TD modifier?
    if (formula.dicePenalty < 0) {
        formula.pool += Math.abs(formula.dicePenalty)
        formula.dicePenalty = 0
    }

    return formula;
}
