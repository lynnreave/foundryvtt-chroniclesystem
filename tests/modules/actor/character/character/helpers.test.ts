import { describe, test, expect } from "@jest/globals";
import {
    calculateIntrigueDefense,
    updateDisposition,
    updateWeaponDefendingState
// @ts-ignore
} from "@actor/character/character/helpers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestGame } from "@mocks/game";
import {
    addTransformer,
    getTransformation
// @ts-ignore
} from "@actor/character/transformers";
// @ts-ignore
import { CHARACTER_DISPOSITIONS } from "@module/selections";
// @ts-ignore
import { CHARACTER_ATTR_CONSTANTS } from "@module/constants";

global.game = new TestGame();
const defaultWeapon = {
    _id: "someId", name: "someName", type: "weapon", damageValue: 3,
    system: {defense: 0, isDefending: false}
};

describe("helpers.js", () => {
    describe("calculate intrigue defense", () => {
        test("call", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Cunning", type: "ability", system: {rating: 4, modifier: 0}
            };
            character.owned.abilities = [abilityDoc];
            expect(calculateIntrigueDefense(character)).toStrictEqual(8);
        });
        test("modifier", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Cunning", type: "ability", system: {rating: 4, modifier: 0}
            };
            character.owned.abilities = [abilityDoc];
            addTransformer(
                character, "modifiers", "intrigue_defense", "someSource", 2,
                false, true
            );
            expect(calculateIntrigueDefense(character)).toStrictEqual(10);
        });
        test("ignore cunning", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = {
                _id: "someId", name: "Cunning", type: "ability", system: {rating: 4, modifier: 0}
            };
            character.owned.abilities = [abilityDoc];
            character.system.ignoreIntrigueDefenseCunning = true
            expect(calculateIntrigueDefense(character)).toStrictEqual(4);
        });
        test("override", () => {
            let character: TestCharacter = new TestCharacter();
            character.system.derivedStats.intrigueDefense.override = true;
            character.system.derivedStats.intrigueDefense.overrideValue = 10;
            expect(calculateIntrigueDefense(character)).toStrictEqual(10);
        });
    });
    describe("update character disposition", () => {
        test("disposition exists => disposition", () => {
            let character: TestCharacter = new TestCharacter();
            CHARACTER_DISPOSITIONS.forEach(function (disposition, index) {
                character.system.currentDisposition = index;
                updateDisposition(character, index);
                expect(character.system.currentDisposition).toStrictEqual(index);
                expect(
                    getTransformation(
                        character, "modifiers", CHARACTER_ATTR_CONSTANTS.COMPOSURE_RESISTANCE,
                        false, true
                    ).total
                ).toStrictEqual(disposition.rating);
                expect(
                    getTransformation(
                        character, "modifiers", CHARACTER_ATTR_CONSTANTS.PERSUASION, false, true
                    ).total
                ).toStrictEqual(disposition.persuasionModifier);
                expect(
                    getTransformation(
                        character, "modifiers", CHARACTER_ATTR_CONSTANTS.DECEPTION, false, true
                    ).total
                ).toStrictEqual(disposition.deceptionModifier);
            });
        });
        test("disposition exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            character.system.currentDisposition = 10;
            updateDisposition(character, character.system.currentDisposition);
            expect(character.system["currentDisposition"]).toStrictEqual(character.system.currentDisposition);
            expect(
                getTransformation(
                    character, "modifiers", CHARACTER_ATTR_CONSTANTS.COMPOSURE_RESISTANCE,
                    false, true
                ).total
            ).toStrictEqual(0);
            expect(
                getTransformation(
                    character, "modifiers", CHARACTER_ATTR_CONSTANTS.PERSUASION, false, true
                ).total
            ).toStrictEqual(0);
            expect(
                getTransformation(
                    character, "modifiers", CHARACTER_ATTR_CONSTANTS.DECEPTION, false, true
                ).total
            ).toStrictEqual(0);
        });
    });
    describe("update weapon defending state", () => {
        test("to true", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = Object.assign({}, defaultWeapon);
            weaponDoc.system.defense = 2;
            weaponDoc.system.isDefending = false;
            character.system.owned.weapons = [weaponDoc];
            updateWeaponDefendingState(character, weaponDoc._id, true);
            expect(weaponDoc.system.isDefending).toStrictEqual(true);
            expect(
                getTransformation(character, "modifiers", "combat_defense", false, true).total
            ).toStrictEqual(weaponDoc.system.defense);
        });
        test("to false", () => {
            let character: TestCharacter = new TestCharacter();
            let weaponDoc = Object.assign({}, defaultWeapon);
            weaponDoc.system.defense = 2;
            weaponDoc.system.isDefending = true;
            character.system.owned.weapons = [weaponDoc];
            addTransformer(
                character, "modifiers", "combat_defense", weaponDoc._id, weaponDoc.system.defense,
                true, true
            );
            updateWeaponDefendingState(character, weaponDoc._id, false);
            expect(weaponDoc.system.isDefending).toStrictEqual(false);
            expect(
                getTransformation(character, "modifiers", "combat_defense", false, true).total
            ).toStrictEqual(0);
        });
    });
});
