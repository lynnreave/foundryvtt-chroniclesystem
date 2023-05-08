import { DiceRollFormula } from "./dice-roll-formula.js";
import {
    getAbility,
    getAbilityBySpecialty
} from "../actor/character/abilities.js";
import { getTransformation } from "../actor/character/transformers.js";
import { getData } from "../common.js";
import {
    CHARACTER_ATTR_CONSTANTS,
    DEGREES_CONSTANTS
} from "../constants.js";
import {
    CRITICAL_RESULTS,
    FUMBLE_RESULTS
} from "../selections.js";

/**
 * The base template data object
 * @type {object}
 */
const TEMPLATE_DATA = {
    test: {
        type: "Test",
        tool: {
            name: ""
        }
    },
    source: {
        name: null,
        img: null
    },
    target: null,
    formula: {
        pool: 0,
        bonusDice: 0,
        modifier: 0
    },
    // Die.results (this.results)
    dice: [],
    roll: {
        total: 0
    },
    difficulty: null
};

export function adjustFormulaByWeapon (actor, formula, weapon) {
    /**
     * Adjust a weapon test formula by the weapon.
     * @param {Actor} actor: the actor object wielding the weapon.
     * @param {DiceRollFormula} formula: a formula object for the test.
     * @param {Weapon} weapon: the weapon document object.
     */
    let weaponData = getData(weapon);

    // update weapon formula with custom modifiers
    if (weaponData.customPoolModifier) {
        formula.pool += weaponData.customPoolModifier;
    }
    if (weaponData.customBonusDiceModifier) {
        formula.bonusDice += weaponData.customBonusDiceModifier;
    }
    if (weaponData.customTestModifier) {
        formula.modifier += weaponData.customTestModifier;
    }

    // handle training requirements
    if (!weaponData.training)
        return formula;
    let poolModifier = formula.bonusDice - weaponData.training;
    if (poolModifier <= 0) {
        formula.pool += poolModifier;
        formula.bonusDice = 0;
    } else {
        formula.bonusDice = poolModifier;
    }

    // return
    return formula;
}

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

    // some transformers require the name in lowercase to match CHARACTER_ATTR_CONSTANTS
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

export function getBaseInfluenceForTechnique(characterData, technique) {
    /**
     * Get the base influence damage for a character Actor by technique.
     * @param {Actor} characterData: the data of the character Actor.
     * @param {string} technique: the name of the technique used.
     * @returns {number}: the base influence damage.
     */
    let influenceBaseDamage = 2;
    // determine the source ability by technique
    let influenceSource;
    if (["bargain", "incite"].includes(technique))
    {
        influenceSource = "Cunning";
    } else if (["charm", "seduce"].includes(technique)) {
        influenceSource = "Persuasion";
    } else if (["convince", "intimidate"].includes(technique)) {
        influenceSource = "Will";
    } else if (technique === "taunt") {
        influenceSource = "Awareness";
    }
    // get the ability from character data
    let ability;
    if (influenceSource) {
        ability = characterData.owned.abilities.find(
            (ability) => ability.name === influenceSource
        );
    }
    // get the base influence damage
    if (ability) {
        influenceBaseDamage = getData(ability).rating;
    }
    // return
    return influenceBaseDamage;
}

export function getCurrentTarget(){
    /**
     * Get the current target of the select token.
     * @returns {Actor}: an Actor object.
     */
    let targets = Array.from(game.user.targets);
    let target;
    if (targets.length > 0) {
        let targetToken = targets[0];
        if (targetToken.document && targetToken.document["_actor"]) {
            target = targetToken.document["_actor"];
        }
    }
    return target;
}

export function getDegrees(difficulty, testResult) {
    /**
     * Get the degrees (of success or failure) from a test result.
     * @param {number} difficulty: the difficulty of the test.
     * @param {number} testResult: the result of the test.
     * @returns {object}: a data dict containing the number of degrees and string label.
     */
    // get difference between difficulty and result
    let diff = testResult - difficulty;
    // determine degrees of success or failure
    let degrees = 0;
    if (diff <= -5) {
        degrees = -2;
    } else if (diff <= -1) {
        degrees = -1;
    } else if (diff <= 4) {
        degrees = 1;
    } else if (diff <= 9) {
        degrees = 2;
    } else if (diff <= 14) {
        degrees = 3;
    } else if (diff >= 15) {
        degrees = 4;
    }
    // get degrees label
    let label = DEGREES_CONSTANTS[`${degrees}`];
    // return
    return {num: degrees, label: label}
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

    // handle negative pool (for conflating penalties with poolMods)
    if (formula.pool <= 0) {
        formula.pool = 1
        formula.dicePenalty = 0
    }

    return formula;
}

export function getNumOfRolled(num, dieResults) {
    /**
     * Get the number of specified dies rolled from a test.
     * @param {Array} dieResults: the final results from a Die evaluate().
     * @returns {number}: the number of specified dice rolled.
     */
    let numDice = 0;
    // check if all active dice are 1s
    dieResults.forEach((result) => {
        if (result.active && result.result === num) {
            numDice += 1;
        }
    });
    // return
    return numDice
}

export function getTestDifficultyFromCurrentTarget(rollType, target) {
    /**
     * Get test difficulty from the current target of an Actor.
     * NOTE: this is assuming 1 target (the first in the list) since there are no AoE challenges known.
     * @param {string} rollType: the type of test roll being made (e.g., "weapon-test").
     * @param {Actor} target: an Actor object.
     * @returns {object}: a data object container the test difficulty info.
     */
    let result = {
        difficulty: null, vFighting: null, vMarksmanship: null
    };
    // get target data
    if (!target) { return result;}
    let targetData = getData(target);
    // get difficulty by roll type
    switch (rollType) {
        case "weapon-test":
            result.difficulty = targetData["derivedStats"]["combatDefense"].total;
            if (targetData["discreteDefenses"]) {
                result.vFighting = targetData["discreteDefenses"]["vFighting"].total;
                result.vMarksmanship = targetData["discreteDefenses"]["vMarksmanship"].total;
            }
            break;
        case "persuasion":
        case "deception":
            result.difficulty = targetData["derivedStats"]["intrigueDefense"].total;
            break;
    }
    // return
    return result;
}

export function getRollTemplateData(actor, rollType, formula, roll, dieResults, toolName) {
    /**
     * Get roll template data for rendering to roll card.
     * @param {Actor} actor: the Actor making the roll.
     * @param {string} rollType: the type of test roll being made (e.g., "weapon-test").
     * @param {DiceRollFormula} formula: the DiceRollFormula containing all roll formula data.
     * @param {Roll} roll: an evaluated Roll object with the roll results.
     * @param {Array} dieResults: the final results from a Die evaluate().
     * @param {string} toolName: the name of the tool used to execute the test.
     * @returns {object}: a template data object.
     */
    // base template data
    let templateData = Object.assign({}, TEMPLATE_DATA);
    // update w/ source data
    templateData.source = actor;
    let actorData = getData(actor);
    // update w/ target data (if any)
    let target = getCurrentTarget();
    templateData.target = target;
    // update w/ formula data
    templateData.formula.pool = formula.pool;
    templateData.formula.bonusDice = formula.bonusDice;
    templateData.formula.modifier = formula.modifier;
    // update w/ die results data
    templateData.dice = dieResults;
    // update w/ roll data
    templateData.roll.total = roll.total;
    // update w/ test data
    let testName = "";
    for (let word of rollType.split('-')) {
        testName += word.charAt(0).toUpperCase();
        testName += word.slice(1);
        testName += " ";
    }
    templateData.test.type = testName.trim();
    // update w/ tool name
    templateData.test.tool.name = toolName;
    // get tool, damage, and target resistance
    let tool;
    let damageValue;
    let resistance;
    if (rollType === "weapon-test") {
        tool = actorData.owned.weapons.find((weapon) => weapon.name === toolName)
        if (tool) {
            templateData.test.tool = tool;
            damageValue = tool.damageValue;
        }
        // get resistance from target damage resistance
        if (target) {
            resistance = getTransformation(
                target, "modifiers", CHARACTER_ATTR_CONSTANTS.DAMAGE_TAKEN
            ).total;
        }
    } else if (["persuasion", "deception"].includes(rollType)) {
        let influenceBaseDamage = getBaseInfluenceForTechnique(actorData, toolName);
        if (influenceBaseDamage) {
            damageValue = influenceBaseDamage;
            toolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);
            templateData.test.tool = {name: toolName, damageValue: damageValue};
        }
        // get resistance from target composure resistance
        if (target) {
            resistance = getTransformation(
                target, "modifiers", CHARACTER_ATTR_CONSTANTS.COMPOSURE_RESISTANCE
            ).total;
        }
    }
    // update w/ difficulty data
    let difficultyData = getTestDifficultyFromCurrentTarget(
        rollType, templateData.target
    );
    if (difficultyData.difficulty) {
        // update w/ degrees
        let degreesData = getDegrees(
            difficultyData.difficulty, templateData.roll.total
        );
        templateData.difficulty = {
            degrees: degreesData.num,
            text: degreesData.label
        };
        // update w/ calculated damage
        if (damageValue) {
            let totalDamage = degreesData.num * damageValue;
            if (resistance) { totalDamage -= resistance; }
            templateData.difficulty.damage = Math.max(totalDamage, 0);
        }
        // update w/ critical or fumble
        if (rollType === "weapon-test") {
            if (isCritical(templateData.roll.total, difficultyData.difficulty)) {
                // get number of 6s rolled
                let numSixes = Math.min(Math.max(getNumOfRolled(6, dieResults) - 1, 0), 8);
                templateData.difficulty.criticalData = {
                    num: numSixes,
                    result: CRITICAL_RESULTS[numSixes],
                    results: CRITICAL_RESULTS
                };
                // handle solid hit
                if (numSixes === 0) {
                    templateData.difficulty.criticalData.damage = templateData.difficulty.damage + (2 * degreesData.num)
                } else if (numSixes === 1) {
                    templateData.difficulty.criticalData.damage = templateData.difficulty.damage + (4 * degreesData.num)
                }
            } else if (isFumble(templateData.dice)) {
                let numOnes = Math.min(Math.max(getNumOfRolled(1, dieResults) - 1, 0), 8);
                templateData.difficulty.fumbleData = {
                    num: numOnes,
                    result: FUMBLE_RESULTS[numOnes],
                    results: FUMBLE_RESULTS
                };
            }
        }
    }
    // return
    return templateData;
}

export function isCritical(result, difficulty) {
    /**
     * Determine if a (weapon) test result is a critical.
     * @param {number} result: the result (total) of the test.
     * @param {difficulty} difficulty: the difficulty of the test.
     * @returns {boolean}: whether the test result is a critical.
     */
    return (result - difficulty) >= 10;
}

export function isFumble(dieResults) {
    /**
     * Determine if a (weapon) test result is a fumble.
     * @param {Array} dieResults: the final results from a Die evaluate().
     * @returns {boolean}: whether the test result is a fumble.
     */
    let isFumble = true;
    // check if all active dice are 1s
    dieResults.forEach((result) => {
        if (result.active && result.result > 1) {
            isFumble = false;
        }
    });
    // return
    return isFumble
}
