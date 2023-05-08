import {
    adjustFormulaByWeapon,
    getAbilityTestFormula,
    getBaseInfluenceForTechnique,
    getCurrentTarget,
    getDegrees,
    getFormula,
    getNumOfRolled,
    getRollTemplateData,
    getTestDifficultyFromCurrentTarget,
    isCritical,
    isFumble
// @ts-ignore
} from "@roll/rolls";
// @ts-ignore
import { DiceRollFormula } from "@roll/dice-roll-formula";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestGame } from "@mocks/game";
import {
    DEGREES_CONSTANTS,
    CHARACTER_ATTR_CONSTANTS,
    KEY_CONSTANTS
// @ts-ignore
} from "@module/constants";
import {
    addTransformer
// @ts-ignore
} from "@actor/character/transformers";

const defaultAbility = {
    _id: "someId", name: "someName", type: "ability", system: {rating: 5, modifier: 0}
};
const defaultWeapon = {
    _id: "someId", name: "someName", type: "weapon", damageValue: 3, system: {}
};
const defaultArmor = {
    _id: "someId", name: "someName", type: "armor", system: {equipped: 1, rating: 5}
};
const defaultSpecialty = {name: 'someName', rating: 1, modifier: 1};
const defaultTransformer = {_id: "source", mod: 1, isDocument: false};
const defaultDifficulty: number = 6;

describe("rolls.js", () => {
    describe("adjust formula by weapon", () => {
        test("custom pool modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = {name: "someName", system: {customPoolModifier: 1}};
            let rollDef = ["weapon-test", weaponDoc.name, "5|4|3|2|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let adjustedFormula = adjustFormulaByWeapon(character, formula, weaponDoc);
            expect(adjustedFormula.pool).toStrictEqual(6)
        });
        test("custom bonus dice modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = {name: "someName", system: {customBonusDiceModifier: 1}};
            let rollDef = ["weapon-test", weaponDoc.name, "5|4|3|2|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let adjustedFormula = adjustFormulaByWeapon(character, formula, weaponDoc);
            expect(adjustedFormula.bonusDice).toStrictEqual(5)
        });
        test("custom bonus dice modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = {name: "someName", system: {customTestModifier: 1}};
            let rollDef = ["weapon-test", weaponDoc.name, "5|4|3|2|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let adjustedFormula = adjustFormulaByWeapon(character, formula, weaponDoc);
            expect(adjustedFormula.modifier).toStrictEqual(4)
        });
        test("training", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = {name: "someName", system: {training: 1}};
            let rollDef = ["weapon-test", weaponDoc.name, "5|4|3|2|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let adjustedFormula = adjustFormulaByWeapon(character, formula, weaponDoc);
            expect(adjustedFormula.bonusDice).toStrictEqual(3)
        });
        test("training insufficient", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = {name: "someName", system: {training: 5}};
            let rollDef = ["weapon-test", weaponDoc.name, "5|4|3|2|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let adjustedFormula = adjustFormulaByWeapon(character, formula, weaponDoc);
            expect(adjustedFormula.pool).toStrictEqual(4)
            expect(adjustedFormula.bonusDice).toStrictEqual(0)
        });
    });
    describe("get ability test formula", () => {
        test("ability exists", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: 0,
                bonusDice: 0,
                modifier: 0
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("ability exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [];
            let expected = {
                pool: 2,
                dicePenalty: 0,
                bonusDice: 0,
                modifier: 0
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("ability w/ specialty exists", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            let specialty = Object.assign({}, defaultSpecialty)
            abilityDoc.system["specialties"] = [specialty];
            character.owned.abilities = [abilityDoc];
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: 0,
                bonusDice: specialty.rating,
                modifier: specialty.modifier
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name, specialty.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("ability w/ specialty exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            let specialty = Object.assign({}, defaultSpecialty)
            abilityDoc.system["specialties"] = [];
            character.owned.abilities = [abilityDoc];
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: 0,
                bonusDice: 0,
                modifier: 0
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name, specialty.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("bonuses/modifiers & specialty w/o rating/modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            let specialty = {name: 'someName'};
            abilityDoc.system["specialties"] = [specialty];
            character.owned.abilities = [abilityDoc];
            let transformer = Object.assign({}, defaultTransformer)
            character.system["bonuses"][abilityDoc.name.toLowerCase()] = [transformer]
            character.system["modifiers"][abilityDoc.name.toLowerCase()] = [transformer]
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: 0,
                bonusDice: transformer.mod,
                modifier: transformer.mod
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name, specialty.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("has pool modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let transformer = Object.assign({}, defaultTransformer)
            character.system["poolMods"][abilityDoc.name.toLowerCase()] = [transformer]
            let expected = {
                pool: abilityDoc.system.rating + transformer.mod,
                dicePenalty: 0,
                bonusDice: 0,
                modifier: 0
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("has penalty", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let transformer = Object.assign({}, defaultTransformer)
            character.system["penalties"][abilityDoc.name.toLowerCase()] = [transformer]
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: transformer.mod,
                bonusDice: 0,
                modifier: 0
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("has bonus", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let transformer = Object.assign({}, defaultTransformer)
            character.system["bonuses"][abilityDoc.name.toLowerCase()] = [transformer]
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: 0,
                bonusDice: transformer.mod,
                modifier: 0
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
        test("has modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let transformer = Object.assign({}, defaultTransformer)
            character.system["modifiers"][abilityDoc.name.toLowerCase()] = [transformer]
            let expected = {
                pool: abilityDoc.system.rating,
                dicePenalty: 0,
                bonusDice: 0,
                modifier: transformer.mod
            }
            let formula: DiceRollFormula = getAbilityTestFormula(character, abilityDoc.name);
            let actual = {
                pool: formula.pool,
                dicePenalty: formula.dicePenalty,
                bonusDice: formula.bonusDice,
                modifier: formula.modifier
            }
            expect(actual).toStrictEqual(expected);
        });
    });
    describe("get base influence for technique", () => {
        test("cunning", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Cunning", type: "ability", system: {rating: 4, modifier: 0}
            };
            character.system.owned.abilities = [abilityDoc];
            let output = getBaseInfluenceForTechnique(character.system, "bargain");
            expect(output).toStrictEqual(abilityDoc.system.rating);
            output = getBaseInfluenceForTechnique(character.system, "incite");
            expect(output).toStrictEqual(abilityDoc.system.rating);
        });
        test("persuasion", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Persuasion", type: "ability", system: {rating: 3, modifier: 0}
            };
            character.system.owned.abilities = [abilityDoc];
            let output = getBaseInfluenceForTechnique(character.system, "charm");
            expect(output).toStrictEqual(abilityDoc.system.rating);
            output = getBaseInfluenceForTechnique(character.system, "seduce");
            expect(output).toStrictEqual(abilityDoc.system.rating);
        });
        test("will", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Will", type: "ability", system: {rating: 2, modifier: 0}
            };
            character.system.owned.abilities = [abilityDoc];
            let output = getBaseInfluenceForTechnique(character.system, "convince");
            expect(output).toStrictEqual(abilityDoc.system.rating);
            output = getBaseInfluenceForTechnique(character.system, "intimidate");
            expect(output).toStrictEqual(abilityDoc.system.rating);
        });
        test("awareness", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Awareness", type: "ability", system: {rating: 1, modifier: 0}
            };
            character.system.owned.abilities = [abilityDoc];
            let output = getBaseInfluenceForTechnique(character.system, "taunt");
            expect(output).toStrictEqual(abilityDoc.system.rating);
        });
        test("target ability does not exist", () => {
            let character: TestCharacter = new TestCharacter();
            character.system.owned.abilities = [];
            let output = getBaseInfluenceForTechnique(character.system, "taunt");
            expect(output).toStrictEqual(2);
        });
    });
    describe("get current target", () => {
        test("has target", () => {
            let character: TestCharacter = new TestCharacter();
            let token: object = {document: {_actor: character}};
            let game: TestGame = new TestGame();
            game.user.targets = [token];
            global.game = game;
            expect(getCurrentTarget()).toStrictEqual(character);
        });
        test("has target - negative", () => {
            let game: TestGame = new TestGame();
            game.user.targets = [];
            global.game = game;
            expect(getCurrentTarget()).toStrictEqual(undefined);
        });
    });
    describe("get degrees", () => {
        test("2 degrees of failure", () => {
            let output = getDegrees(defaultDifficulty, defaultDifficulty - 5);
            expect(output.num).toStrictEqual(-2)
            expect(output.label).toStrictEqual(DEGREES_CONSTANTS["-2"])
        });
        test("1 degree of failure", () => {
            for (let i: number = -4; i <= -1; i++) {
                let output = getDegrees(defaultDifficulty, defaultDifficulty + i);
                expect(output.num).toStrictEqual(-1)
                expect(output.label).toStrictEqual(DEGREES_CONSTANTS["-1"])
            }
        });
        test("1 degree of success", () => {
            for (let i: number = 0; i <= 4; i++) {
                let output = getDegrees(defaultDifficulty, defaultDifficulty + i);
                expect(output.num).toStrictEqual(1)
                expect(output.label).toStrictEqual(DEGREES_CONSTANTS["1"])
            }
        });
        test("2 degrees of success", () => {
            for (let i: number = 5; i <= 9; i++) {
                let output = getDegrees(defaultDifficulty, defaultDifficulty + i);
                expect(output.num).toStrictEqual(2)
                expect(output.label).toStrictEqual(DEGREES_CONSTANTS["2"])
            }
        });
        test("3 degrees of success", () => {
            for (let i: number = 10; i <= 14; i++) {
                let output = getDegrees(defaultDifficulty, defaultDifficulty + i);
                expect(output.num).toStrictEqual(3)
                expect(output.label).toStrictEqual(DEGREES_CONSTANTS["3"])
            }
        });
        test("4 degrees of success", () => {
            let output = getDegrees(defaultDifficulty, defaultDifficulty + 15);
            expect(output.num).toStrictEqual(4)
            expect(output.label).toStrictEqual(DEGREES_CONSTANTS["4"])
        });
    });
    describe("get formula", () => {
        test("default", () => {
            let character: TestCharacter = new TestCharacter();
            let rollType = "formula";
            let sourceName = "someSource";
            let formulaStr = "2|0|0|0|0";
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(formulaStr);
        });
        test("ability", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let rollType = "ability";
            let sourceName = abilityDoc.name;
            let formulaStr = `${abilityDoc.system.rating}|0|0|0|0`;
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(formulaStr);
        });
        test("specialty", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            let specialty = Object.assign({}, defaultSpecialty)
            abilityDoc.system["specialties"] = [specialty];
            character.owned.abilities = [abilityDoc];
            let rollType = "specialty";
            let sourceName = specialty.name;
            let abilityName = abilityDoc.name
            let rollDef = [rollType, sourceName, abilityName];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let expected = `${abilityDoc.system.rating}|${specialty.rating}|${specialty.modifier}|0|0`;
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(expected);
        });
        test("weapon test", () => {
            let character: TestCharacter = new TestCharacter();
            let rollType = "weapon-test";
            let sourceName = "someSource";
            let formulaStr = "3|1|1|1|0";
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let expected = "3|1|1|1|0";
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(expected);
        });
        test("persuasion", () => {
            let character: TestCharacter = new TestCharacter();
            let rollType = "persuasion";
            let sourceName = "someSource";
            let formulaStr = "3|1|1|1|0";
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let expected = "3|1|1|1|0";
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(expected);
        });
        test("deception", () => {
            let character: TestCharacter = new TestCharacter();
            let rollType = "deception";
            let sourceName = "someSource";
            let formulaStr = "3|1|1|1|0";
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let expected = "3|1|1|1|0";
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(expected);
        });
        test("pool < 1", () => {
            let character: TestCharacter = new TestCharacter();
            let rollType = "weapon-test";
            let sourceName = "someSource";
            let formulaStr = "0|1|1|0|0";
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let expected = "1|1|1|0|0";
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(expected);
        });
    });
    describe("get num sixes rolled", () => {
        test("call", () => {
            let dieResults = [
                {result: 1, active: true},
                {result: 6, active: true},
                {result: 6, active: true},
                {result: 1, active: false, discarded: true}
            ];
            expect(getNumOfRolled(6, dieResults)).toStrictEqual(2);
            expect(getNumOfRolled(1, dieResults)).toStrictEqual(1);
        });
    });
    describe("get roll template data", () => {
        test("weapon test", () => {
            let character: TestCharacter = new TestCharacter();
            character.name = "Some Name";
            character.img = "/some/img/path";
            let weaponDoc = Object.assign({}, defaultWeapon)
            character.system.owned.weapons = [weaponDoc];
            let targetCharacter: TestCharacter = new TestCharacter();
            targetCharacter.name = "Other Name";
            targetCharacter.img = "/other/img/path";
            targetCharacter.system["derivedStats"] = {combatDefense: {total: 5}};
            let armorDoc = Object.assign({}, defaultArmor)
            targetCharacter.owned.armors = [armorDoc];
            addTransformer(
                targetCharacter, "modifiers", CHARACTER_ATTR_CONSTANTS.DAMAGE_TAKEN,
                armorDoc._id, armorDoc.system.rating,
                true, true
            );
            let token: object = {document: {_actor: targetCharacter}};
            let game: TestGame = new TestGame()
            game.user.targets = [token];
            global.game = game;
            let rollType: string = "weapon-test";
            let rollDef: string[] = [rollType, weaponDoc.name, "2|0|0|0|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let roll = {total: 15};
            formula.reRoll = 0;
            let dieResults = [
                {result: 6, active: true},
                {result: 1, active: false, discarded: true}
            ];
            let output = getRollTemplateData(
                character, rollType, formula, roll, dieResults, weaponDoc.name
            );
            expect(output.source).toStrictEqual(character);
            expect(output.target).toStrictEqual(targetCharacter);
            expect(output.formula.pool).toStrictEqual(formula.pool);
            expect(output.formula.bonusDice).toStrictEqual(formula.bonusDice);
            expect(output.formula.modifier).toStrictEqual(formula.modifier);
            expect(output.roll.total).toStrictEqual(roll.total);
            expect(output.dice).toStrictEqual(dieResults);
            expect(output.test.type).toStrictEqual("Weapon Test");
            expect(output.test.tool.name).toStrictEqual(weaponDoc.name);
            expect(output.difficulty.degrees).toStrictEqual(3);
            expect(output.difficulty.text).toStrictEqual(DEGREES_CONSTANTS["3"]);
            expect(output.difficulty.damage).toStrictEqual(9-armorDoc.system.rating);
        });
        test("intrigue test", () => {
            let character: TestCharacter = new TestCharacter();
            character.name = "Some Name";
            character.img = "/some/img/path";
            let abilityDoc = {
                _id: "someId", name: "Cunning", type: "ability", system: {rating: 4, modifier: 0}
            };
            character.system.owned.abilities = [abilityDoc];
            let targetCharacter: TestCharacter = new TestCharacter();
            targetCharacter.name = "Other Name";
            targetCharacter.img = "/other/img/path";
            targetCharacter.system["derivedStats"] = {intrigueDefense: {total: 5}};
            targetCharacter.system.currentDisposition = "3";
            addTransformer(
                targetCharacter, "modifiers", CHARACTER_ATTR_CONSTANTS.COMPOSURE_RESISTANCE,
                KEY_CONSTANTS.DISPOSITION, 4, false, true
            );
            let token: object = {document: {_actor: targetCharacter}};
            let game: TestGame = new TestGame()
            game.user.targets = [token];
            global.game = game;
            let toolName = "bargain";
            let rollType: string = "persuasion";
            let rollDef: string[] = [rollType, abilityDoc.name, "2|0|0|0|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let roll = {total: 10};
            formula.reRoll = 0;
            let dieResults = [];
            let output = getRollTemplateData(
                character, rollType, formula, roll, dieResults, toolName
            );
            expect(output.source).toStrictEqual(character);
            expect(output.target).toStrictEqual(targetCharacter);
            expect(output.test.type).toStrictEqual("Persuasion");
            expect(output.test.tool.name).toStrictEqual("Bargain");
            expect(output.difficulty.degrees).toStrictEqual(2);
            expect(output.difficulty.text).toStrictEqual(DEGREES_CONSTANTS["2"]);
            expect(output.difficulty.damage).toStrictEqual(8-4);
        });
        test("critical 2 sixes", () => {
            let character: TestCharacter = new TestCharacter();
            character.name = "Some Name";
            character.img = "/some/img/path";
            let weaponDoc = Object.assign({}, defaultWeapon)
            character.system.owned.weapons = [weaponDoc];
            let targetCharacter: TestCharacter = new TestCharacter();
            targetCharacter.name = "Other Name";
            targetCharacter.img = "/other/img/path";
            targetCharacter.system["derivedStats"] = {combatDefense: {total: 5}};
            let armorDoc = Object.assign({}, defaultArmor)
            targetCharacter.owned.armors = [armorDoc];
            addTransformer(
                targetCharacter, "modifiers", CHARACTER_ATTR_CONSTANTS.DAMAGE_TAKEN,
                armorDoc._id, armorDoc.system.rating,
                true, true
            );
            let token: object = {document: {_actor: targetCharacter}};
            let game: TestGame = new TestGame()
            game.user.targets = [token];
            global.game = game;
            let rollType: string = "weapon-test";
            let rollDef: string[] = [rollType, weaponDoc.name, "2|0|0|0|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let roll = {total: 15};
            formula.reRoll = 0;
            let dieResults = [
                {result: 6, active: true},
                {result: 6, active: true},
                {result: 1, active: false, discarded: true}
            ];
            let output = getRollTemplateData(
                character, rollType, formula, roll, dieResults, weaponDoc.name
            );
            expect(output.difficulty.criticalData.num).toStrictEqual(1);
        });
        test("fumble", () => {
            let character: TestCharacter = new TestCharacter();
            character.name = "Some Name";
            character.img = "/some/img/path";
            let weaponDoc = Object.assign({}, defaultWeapon)
            character.system.owned.weapons = [weaponDoc];
            let targetCharacter: TestCharacter = new TestCharacter();
            targetCharacter.name = "Other Name";
            targetCharacter.img = "/other/img/path";
            targetCharacter.system["derivedStats"] = {combatDefense: {total: 5}};
            let armorDoc = Object.assign({}, defaultArmor)
            targetCharacter.owned.armors = [armorDoc];
            addTransformer(
                targetCharacter, "modifiers", CHARACTER_ATTR_CONSTANTS.DAMAGE_TAKEN,
                armorDoc._id, armorDoc.system.rating,
                true, true
            );
            let token: object = {document: {_actor: targetCharacter}};
            let game: TestGame = new TestGame()
            game.user.targets = [token];
            global.game = game;
            let rollType: string = "weapon-test";
            let rollDef: string[] = [rollType, weaponDoc.name, "2|0|0|0|0"];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let roll = {total: 0};
            formula.reRoll = 0;
            let dieResults = [
                {result: 1, active: true},
                {result: 1, active: false, discarded: true}
            ];
            let output = getRollTemplateData(
                character, rollType, formula, roll, dieResults, weaponDoc.name
            );
            expect(output.difficulty.fumbleData.num).toStrictEqual(0);
        });
    });
    describe("get test difficulty from actor target", () => {
        test("no targets", () => {
            let rollType = "weapon-test";
            let game: TestGame = new TestGame();
            game.user.targets = [];
            global.game = game;
            let output = getTestDifficultyFromCurrentTarget(rollType, null);
            expect(output.difficulty).toStrictEqual(null);
        });
        test("weapon-test", () => {
            let rollType = "weapon-test";
            let character: TestCharacter = new TestCharacter();
            character.system["derivedStats"] = {
                combatDefense: {total: 9}
            };
            let output = getTestDifficultyFromCurrentTarget(rollType, character);
            expect(output.difficulty).toStrictEqual(9);
        });
        test("persuasion", () => {
            let rollType = "persuasion";
            let character: TestCharacter = new TestCharacter();
            character.system["derivedStats"] = {
                intrigueDefense: {total: 12}
            };
            let output = getTestDifficultyFromCurrentTarget(rollType, character);
            expect(output.difficulty).toStrictEqual(12);
        });
        test("deception", () => {
            let rollType = "deception";
            let character: TestCharacter = new TestCharacter();
            character.system["derivedStats"] = {
                intrigueDefense: {total: 6}
            };
            let output = getTestDifficultyFromCurrentTarget(rollType, character);
            expect(output.difficulty).toStrictEqual(6);
        });
        test("unsupported roll type", () => {
            let rollType = "someUnsupportedType";
            let character: TestCharacter = new TestCharacter();
            character.system["derivedStats"] = {
                intrigueDefense: {total: 6},
                combatDefense: {total: 9}
            };
            let output = getTestDifficultyFromCurrentTarget(rollType, character);
            expect(output.difficulty).toStrictEqual(null);
        });
        test("weapon-test against unit", () => {
            let rollType = "weapon-test";
            let character: TestCharacter = new TestCharacter();
            character.system["derivedStats"] = {
                combatDefense: {total: 10}
            };
            character.system["discreteDefenses"] = {
                vFighting: {total: 5},
                vMarksmanship: {total: 15}
            };
            let output = getTestDifficultyFromCurrentTarget(rollType, character);
            expect(output.difficulty).toStrictEqual(10);
            expect(output.vFighting).toStrictEqual(5);
            expect(output.vMarksmanship).toStrictEqual(15);
        });
    });
    describe("is critical", () => {
        test("is critical", () => {
            let result = 20;
            let difficulty = 10;
            expect(isCritical(result, difficulty)).toStrictEqual(true);
        });
        test("is not critical", () => {
            let result = 19;
            let difficulty = 10;
            expect(isCritical(result, difficulty)).toStrictEqual(false);
        });
    });
    describe("is fumble", () => {
        test("is fumble", () => {
            let dieResults = [
                {result: 1, active: true},
                {result: 1, active: true},
                {result: 1, active: true},
                {result: 1, active: false, discarded: true}
            ];
            expect(isFumble(dieResults)).toStrictEqual(true);
        });
        test("is not fumble", () => {
            let dieResults = [
                {result: 1, active: true},
                {result: 1, active: true},
                {result: 5, active: true},
                {result: 1, active: false, discarded: true}
            ];
            expect(isFumble(dieResults)).toStrictEqual(false);
        });
    });
});
