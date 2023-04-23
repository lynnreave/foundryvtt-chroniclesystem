import {
    getCommander,
    getAttachedHeroes,
    updateAttachedHeroesEffects
// @ts-ignore
} from "@actor/character/unit/helpers";
// @ts-ignore
import { TestCharacter } from "../../../../mocks/character";
import {
    CHARACTER_ATTR_CONSTANTS,
    EQUIPPED_CONSTANTS,
    KEY_CONSTANTS
// @ts-ignore
} from "@module/constants.js";


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
            expect(unit["penalties"][CHARACTER_ATTR_CONSTANTS.FIGHTING]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: -1, isDocument: false}
            ])
            expect(unit.system["penalties"][CHARACTER_ATTR_CONSTANTS.FIGHTING]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: -1, isDocument: false}
            ])
            expect(unit["penalties"][CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: -1, isDocument: false}
            ])
            expect(unit.system["penalties"][CHARACTER_ATTR_CONSTANTS.MARKSMANSHIP]).toStrictEqual([
                {_id: KEY_CONSTANTS.HEROES, mod: -1, isDocument: false}
            ])
        });
        test("attached hero - negative", () => {
            let unit: TestCharacter = new TestCharacter();
            updateAttachedHeroesEffects(unit);
            expect(unit["modifiers"]).toStrictEqual({})
            expect(unit.system["modifiers"]).toStrictEqual({})
            expect(unit["penalties"]).toStrictEqual({})
            expect(unit.system["penalties"]).toStrictEqual({})
            expect(unit["penalties"]).toStrictEqual({})
            expect(unit.system["penalties"]).toStrictEqual({})
        });
    });
});
