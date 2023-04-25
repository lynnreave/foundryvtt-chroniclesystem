import {
    getAbilityTestFormula, getFormula
// @ts-ignore
} from "@roll/rolls";
// @ts-ignore
import { DiceRollFormula } from "@roll/dice-roll-formula";
// @ts-ignore
import { TestCharacter } from "@mocks/character";

const defaultAbility = {
    _id: "someId", name: "someName", type: "ability", system: {rating: 5, modifier: 0}
};
const defaultSpecialty = {name: 'someName', rating: 1, modifier: null};
const defaultTransformer = {_id: "source", mod: 1, isDocument: false};

describe("rolls.js", () => {
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
            let expected = `${abilityDoc.system.rating}|${specialty.rating}|0|0|0`;
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
        test("pool bonus", () => {
            let character: TestCharacter = new TestCharacter();
            let rollType = "weapon-test";
            let sourceName = "someSource";
            let formulaStr = "3|1|1|-2|0";
            let rollDef = [rollType, sourceName, formulaStr];
            let formula: DiceRollFormula = getFormula(rollDef, character);
            let expected = "5|1|1|0|0";
            formula.reRoll = 0;
            expect(formula.toStr()).toStrictEqual(expected);
        });
    });
});
