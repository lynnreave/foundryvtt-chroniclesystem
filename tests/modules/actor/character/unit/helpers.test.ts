import {describe, expect, test} from "@jest/globals";
import {
    getCommander,
    getAttachedHeroes,
    updateAttachedHeroesEffects,
    updateDisorganisation,
    updateFacing,
    updateFormation,
    updateOrdersReceived,
    updateStatus,
    updateTraining
// @ts-ignore
} from "@actor/character/unit/helpers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
import {
    CHARACTER_ATTR_CONSTANTS,
    EQUIPPED_CONSTANTS,
    KEY_CONSTANTS
// @ts-ignore
} from "@module/constants.js";
// @ts-ignore
import {
    UNIT_STATUSES,
    UNIT_FACINGS,
    UNIT_FORMATIONS
// @ts-ignore
} from "@module/selections";
import {
    getTransformation
// @ts-ignore
} from "@actor/character/transformers";


describe("unit.js", () => {
    describe("get commander", () => {
        test("assigned", () => {
            let expected = {
                type: "hero", system: {equipped: EQUIPPED_CONSTANTS.COMMANDER}
            }
            expect(getCommander([expected])).toBe(expected);
        });
        test("none assigned", () => {
            expect(getCommander([
                {type: "hero", system: {equipped: EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED}
                }])).toBe(null);
        });
        test("no heroes", () => {
            expect(getCommander([
                {type: 'weapon', system: {equipped: EQUIPPED_CONSTANTS.COMMANDER}}
            ])).toBe(null);
        });
        test("no items", () => {
            expect(getCommander([])).toBe(null);
        });
    });
    describe("get heroes", () => {
        test("none", () => {
            expect(getAttachedHeroes([])).toStrictEqual([]);
        });
        test("one", () => {
            let items = [{type: "hero"}]
            expect(getAttachedHeroes(items)).toStrictEqual(items);
        });
        test("many", () => {
            let items = [{type: "hero"}, {type: "hero"}, {type: "hero"}]
            expect(getAttachedHeroes(items)).toStrictEqual(items);
        });
        test("mixed", () => {
            let expected = [{type: "hero"}, {type: "hero"}, {type: "hero"}]
            let items = [{type: 'weapon'}].concat(expected)
            expect(getAttachedHeroes(items)).toStrictEqual(expected);
        });
        test("assigned commander", () => {
            let expected = [
                {type: "hero", system: {equipped: EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED}},
                {type: "hero", system: {equipped: EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED}}
            ]
            let items = [
                {type: "hero", system: {equipped: EQUIPPED_CONSTANTS.COMMANDER}}
            ].concat(expected)
            expect(getAttachedHeroes(items)).toStrictEqual(expected);
        });
        test("only commander", () => {
            expect(getAttachedHeroes([{
                type: "hero", system: {equipped: EQUIPPED_CONSTANTS.COMMANDER}
            }])).toStrictEqual([]);
        });
    });
    describe("update attached heroes effects", () => {
        test("attached hero", () => {
            let unit: TestCharacter = new TestCharacter();
            let heroDoc = {
                _id: "heroId", name: "heroName", type: "hero",
                system: {equipped: EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED}
            };
            unit.owned["heroes"] = [heroDoc];
            updateAttachedHeroesEffects(unit);
            expect(unit["modifiers"][CHARACTER_ATTR_CONSTANTS.DISCIPLINE]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: -3, isDocument: false}
            ])
            expect(unit.system["modifiers"][CHARACTER_ATTR_CONSTANTS.DISCIPLINE]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: -3, isDocument: false}
            ])
            expect(unit["poolMods"][CHARACTER_ATTR_CONSTANTS.FIGHTING]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: 1, isDocument: false}
            ])
            expect(unit.system["poolMods"][CHARACTER_ATTR_CONSTANTS.FIGHTING]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: 1, isDocument: false}
            ])
            expect(unit["poolMods"][CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: 1, isDocument: false}
            ])
            expect(unit.system["poolMods"][CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: 1, isDocument: false}
            ])
        });
        test("attached hero - negative", () => {
            let unit: TestCharacter = new TestCharacter();
            updateAttachedHeroesEffects(unit);
            expect(unit["modifiers"]).toStrictEqual({})
            expect(unit.system["modifiers"]).toStrictEqual({})
            expect(unit["poolMods"]).toStrictEqual({})
            expect(unit.system["poolMods"]).toStrictEqual({})
            expect(unit["poolMods"]).toStrictEqual({})
            expect(unit.system["poolMods"]).toStrictEqual({})
        });
    });
    describe("update disorganisation", () => {
        test("positive value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 1;
            updateDisorganisation(unit, newValue);
            expect(unit.system.disorganisation.current).toStrictEqual(newValue);
            expect(
                getTransformation(unit, "poolMods", "all").total
            ).toStrictEqual(-newValue);
            expect(
                getTransformation(unit, "modifiers", "discipline").total
            ).toStrictEqual(newValue*3);
        });
        test("0 value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 0;
            updateDisorganisation(unit, newValue);
            expect(unit.system.disorganisation.current).toStrictEqual(newValue);
            expect(
                getTransformation(unit, "poolMods", "all").total
            ).toStrictEqual(0);
            expect(
                getTransformation(unit, "modifiers", "discipline").total
            ).toStrictEqual(0);
        });
    });
    describe("update facing", () => {
        test("facing exists => unit facing", () => {
            let unit: TestCharacter = new TestCharacter();
            UNIT_FACINGS.forEach(function (facing, index) {
                updateFacing(unit, index);
                expect(unit.system.currentFacing).toStrictEqual(index);
                expect(
                    getTransformation(unit, "poolMods", "fighting", false, true).total
                ).toStrictEqual(facing.testDiceModifier);
                expect(
                    getTransformation(unit, "bonuses", "fighting", false, true).total
                ).toStrictEqual(facing.bonusDiceModifier);
            });
        });
        test("facing exists - negative", () => {
            let unit: TestCharacter = new TestCharacter();
            updateFacing(unit, 99);
            expect(unit.system.currentFacing).toStrictEqual(0);
            expect(
                getTransformation(unit, "poolMods", "fighting", false, true).total
            ).toStrictEqual(UNIT_FACINGS[0].testDiceModifier);
            expect(
                getTransformation(unit, "bonuses", "fighting", false, true).total
            ).toStrictEqual(UNIT_FACINGS[0].bonusDiceModifier);
        });
    });
    describe("update formation", () => {
        test("formation exists => unit formation", () => {
            let unit: TestCharacter = new TestCharacter();
            UNIT_FORMATIONS.forEach(function (formation, index) {
                updateFormation(unit, index);
                expect(unit.system.currentFormation).toStrictEqual(index);
                expect(
                    getTransformation(unit, "modifiers", "discipline", false, true).total
                ).toStrictEqual(formation.disciplineModifier);
                expect(
                    getTransformation(unit, "modifiers", "combat_defense_fighting", false, true).total
                ).toStrictEqual(formation.fightingDefenseModifier);
                expect(
                    getTransformation(unit, "modifiers", "combat_defense_marksmanship", false, true).total
                ).toStrictEqual(formation.marksmanshipDefenseModifier);
                expect(
                    getTransformation(unit, "modifiers", "movement", false, true).total
                ).toStrictEqual(formation.movementModifier);
                expect(
                    getTransformation(unit, "poolMods", "fighting", false, true).total
                ).toStrictEqual(formation.testDiceModifier);
            });
        });
        test("formation exists - negative", () => {
            let unit: TestCharacter = new TestCharacter();
            updateFormation(unit, 99);
            expect(unit.system.currentFormation).toStrictEqual(0);
            expect(
                getTransformation(unit, "modifiers", "discipline", false, true).total
            ).toStrictEqual(UNIT_FORMATIONS[0].disciplineModifier);
            expect(
                getTransformation(unit, "modifiers", "combat_defense_fighting", false, true).total
            ).toStrictEqual(UNIT_FORMATIONS[0].fightingDefenseModifier);
            expect(
                getTransformation(unit, "modifiers", "combat_defense_marksmanship", false, true).total
            ).toStrictEqual(UNIT_FORMATIONS[0].marksmanshipDefenseModifier);
            expect(
                getTransformation(unit, "modifiers", "movement", false, true).total
            ).toStrictEqual(UNIT_FORMATIONS[0].movementModifier);
            expect(
                getTransformation(unit, "poolMods", "fighting", false, true).total
            ).toStrictEqual(UNIT_FORMATIONS[0].testDiceModifier);
        });
    });
    describe("update orders received", () => {
        test("positive value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 1;
            updateOrdersReceived(unit, newValue);
            expect(unit.system.ordersReceived.current).toStrictEqual(newValue);
            expect(unit.system.discipline.ordersReceivedModifier).toStrictEqual(newValue*3);
        });
        test("0 value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 0;
            updateOrdersReceived(unit, newValue);
            expect(unit.system.ordersReceived.current).toStrictEqual(newValue);
            expect(unit.system.discipline.ordersReceivedModifier).toStrictEqual(newValue*3);
        });
    });
    describe("update status", () => {
        test("status exists => unit status", () => {
            let unit: TestCharacter = new TestCharacter();
            UNIT_STATUSES.forEach(function (unitStatus, index) {
                updateStatus(unit, index);
                expect(unit.system.currentStatus).toStrictEqual(index);
            });
        });
        test("status exists - negative", () => {
            let unit: TestCharacter = new TestCharacter();
            updateStatus(unit, 99);
            expect(unit.system.currentStatus).toStrictEqual(0);
        });
    });
    describe("update training", () => {
        test("0 value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 0;
            updateTraining(unit, newValue);
            expect(unit.system.training.current).toStrictEqual(newValue);
            expect(
                getTransformation(unit, "modifiers", "discipline").total
            ).toStrictEqual(0);
        });
        test("1 value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 1;
            updateTraining(unit, newValue);
            expect(unit.system.training.current).toStrictEqual(newValue);
            expect(
                getTransformation(unit, "modifiers", "discipline").total
            ).toStrictEqual(9);
        });
        test("2 value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 2;
            updateTraining(unit, newValue);
            expect(unit.system.training.current).toStrictEqual(newValue);
            expect(
                getTransformation(unit, "modifiers", "discipline").total
            ).toStrictEqual(6);
        });
        test("3 value", () => {
            let unit: TestCharacter = new TestCharacter();
            let newValue: number = 3;
            updateTraining(unit, newValue);
            expect(unit.system.training.current).toStrictEqual(newValue);
            expect(
                getTransformation(unit, "modifiers", "discipline").total
            ).toStrictEqual(3);
        });
    });
});
