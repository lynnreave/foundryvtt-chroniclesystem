import { DiceRollFormula } from "./dice-roll-formula.js";
import {
    getAbility,
    getAbilityBySpecialty
} from "../actor/character/abilities.js";
import { getTransformation } from "../actor/character/transformers.js";
import { getData } from "../common.js";
import {
    CHARACTER_ATTR_CONSTANTS,
    DEGREES_CONSTANTS,
    EQUIPPED_CONSTANTS
} from "../constants.js";
import {
    CRITICAL_RESULTS,
    FUMBLE_RESULTS
} from "../selections.js";
import { getWeaponTestDataForActor } from "../actor/character/helpers.js";

export function adjustFormulaByMount(character, formula) {
    /**
     * Adjust a weapon test formula by mounted status.
     * @param {Actor} character: the character.
     * @param {DiceRollFormula} formula: a formula object for the test.
     */
    // get current target (if any)
    let target = getCurrentTarget();
    // if target not mounted, add 1 BD
    if (isMounted(character) && target && !isMounted(target)) {
        formula.bonusDice += 1;
    }
    // return
    return formula;
}

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

    // handle unwieldy quality
    if (weaponData.isUnwieldy && isMounted(actor)) {
        formula.pool -= 2;
    }

    // handle mounted quality
    if (weaponData.isMounted && !isMounted(actor)) {
        formula.pool -= 2;
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
        // shallow clone
        ability = Object.assign({}, ability)
        influenceBaseDamage = getData(ability).rating;
    }
    // return
    return influenceBaseDamage;
}

export function getCurrentMount(character) {
    /**
     * Get current mount (if any).
     * @param {Character} character: the character object.
     */
    let currentMount = null;
    let mounts = character.getEmbeddedCollection("Item").filter(
        (item) => item.type === "mount"
    );
    if (mounts) {
        currentMount = mounts.find(
            (mount) => getData(mount).equipped === EQUIPPED_CONSTANTS.MOUNTED
        );
    }
    // return
    return currentMount;
}

export function getCurrentTarget(){
    /**
     * Get the current target of the select token.
     * @returns {Actor}: an Actor object.
     */
    let targets = Array.from(game.user.targets);
    let target;
    console.log(game.user.targets)
    console.log(targets)
    if (targets.length > 0) {
        let targetToken = targets[0];
        if (targetToken.document && targetToken.document["actorId"]) {
            // target = targetToken.document["_actor"];
            target = game.actors.get(targetToken.document.actorId);
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
    let templateData = {
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
        dice: [],
        roll: {
            total: 0
        },
        difficulty: null
    };
    // update w/ source data
    templateData.source = actor;
    let actorData = getData(templateData.source);
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
    let resistance;
    console.log(rollType)
    if (rollType === "weapon-test") {
        tool = actorData.owned.weapons.find((weapon) => weapon.name === toolName)
        console.log(tool)
        if (tool) {
            // something was transposing incorrectly so that weapons overrode each other in .owned
            // getWeaponTestDataForActor(templateData.source, tool)
            templateData.test.tool = Object.assign({}, tool);
        }
        // get resistance from target damage resistance
        console.log(target)
        if (target) {
            resistance = getTransformation(
                target, "modifiers", CHARACTER_ATTR_CONSTANTS.DAMAGE_TAKEN
            ).total;
        }
    } else if (["persuasion", "deception"].includes(rollType)) {
        let influenceBaseDamage = getBaseInfluenceForTechnique(actorData, toolName);
        if (influenceBaseDamage) {
            toolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);
            templateData.test.tool = {name: toolName, damageValue: influenceBaseDamage};
        }
        // get resistance from target composure resistance
        if (target) {
            resistance = getTransformation(
                target, "modifiers", CHARACTER_ATTR_CONSTANTS.COMPOSURE_RESISTANCE
            ).total;
        }
    }
    // update w/ difficulty data
    let difficultyData = {difficult: null};
    if (formula.difficult > 0) {
        difficultyData.difficulty = formula.difficult;
    } else {
        difficultyData = getTestDifficultyFromCurrentTarget(rollType, templateData.target);
    }
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
        templateData.difficulty.damage = getTestDamage(
            rollType, templateData.test.tool.damageValue, degreesData.num, resistance,
            templateData.test.tool, templateData.source
        );
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
        // update w/ triggered data
        templateData.difficulty.triggeredData = getTestTriggeredData(
            rollType, templateData.test.tool, degreesData.num, resistance, templateData.target
        )
    }
    // return
    return templateData;
}

export function getTestDamage(
    testType, baseDamage, degrees, resistance = null, tool = null, character = null
) {
    /**
     * Get the calculated final damage from a test.
     * @param {string} testType: the type of test roll.
     * @param {number} baseDamage: the base damage of the tool for the test roll.
     * @param {number} degrees: the degrees of success or failure (-2, -1, 1, 2, 3).
     * @param {number} resistance: the amount of resistance the target has.
     * @param {object} tool: the tool used for the test roll.
     * @param {Actor} character: the character performing the test.
     * @return {number}: the total calculated damage.
     */

    // handle invalid baseDamage
    if (!baseDamage) { return null; }

    // multiple damage by degrees
    let totalDamage = degrees * baseDamage;

    // handle mounted
    if (character) {
        let currentMount = getCurrentMount(character);
        if (currentMount && getData(currentMount).isStationary) {
            if ((tool && getData(tool).reach && getData(tool).reach < 10) || (tool && !getData(tool).reach)) {
                totalDamage += (degrees * 2);
            }
        }
    }

    // handle resistance
    if (resistance) {
        // subtract resistance from total damage
        totalDamage -= resistance;

        // handle piercing
        if (testType === "weapon-test" && tool && getData(tool).piercing > 0) {
            // damage from piercing cannot be greater than damage resisted
            // but must also be at least the piercing value
            let piercing = getData(tool).piercing
            totalDamage = Math.max(totalDamage + Math.min(piercing, resistance), piercing);
        }
    }

    // damage cannot be less than 0 (degrees of failure)
    return Math.max(totalDamage, 0);
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

export function getTestTriggeredData(
    testType, tool, degrees, resistance, target = null
) {
    /**
     * Get triggered event data for test.
     * @param {string} testType: the type of test roll.
     * @param {object} tool: the tool used for the test roll.
     * @param {number} degrees: the degrees of success or failure (-2, -1, 1, 2, 3).
     * @param {number} resistance: the amount of resistance the target has.
     * @param {number} damage: the amount of resistance the target has.
     * @param {Actor} totalDamage: the totalDamage calculated from the test.
     * @returns {object}: an array of data objects containing triggered data.
     */
    let triggeredData = [];
    // handle impaling
    if (testType === "weapon-test" && degrees >= 3 && getData(tool).isImpaling) {
        triggeredData.push({
            label: "CS.chatMessages.impaled",
            text: "CS.chatMessages.impaledDesc",
            result: `Difficulty ${3 + resistance}`
        });
    }
    // handle shattering
    if (testType === "weapon-test" && degrees >= 2 && getData(tool).shattering > 0) {
        triggeredData.push({
            label: "CS.chatMessages.shattered",
            text: "CS.chatMessages.shatteredDesc",
            result: `${getData(tool).shattering} Shattered`
        });
    }
    // handle staggering
    if (testType === "weapon-test" && degrees >= 2 && getData(tool).isStaggering) {
        triggeredData.push({
            label: "CS.chatMessages.staggered",
            text: "CS.chatMessages.staggeredDesc",
            result: `- ${tool.damageValue} Damage`
        });
    }
    // return
    return triggeredData
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
    return isFumble;
}

export function isMounted(character) {
    /**
     * Determine if a character is currently mounted.
     * @param {Character} character: the character.
     * @returns {boolean}: whether the character is mounted.
     */
    let isMounted = false;
    // get current mount (if exists, character is mounted)
    let currentMount = getCurrentMount(character);
    if (currentMount) { isMounted = true; }
    // return
    return isMounted;
}
