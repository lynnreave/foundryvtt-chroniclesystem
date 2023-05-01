import { describe, test, expect } from "@jest/globals";
import {
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
    getTransformation,
    saveTransformers
// @ts-ignore
} from "@actor/character/transformers";
// @ts-ignore
import { CHARACTER_DISPOSITIONS } from "@module/selections";

global.game = new TestGame();
const defaultWeapon = {
    _id: "someId", name: "someName", type: "weapon", damageValue: 3,
    system: {defense: 0, isDefending: false}
};

describe("helpers.js", () => {
    describe("update character disposition", () => {
        test("disposition exists => disposition", () => {
            let character: TestCharacter = new TestCharacter();
            CHARACTER_DISPOSITIONS.forEach(function (disposition, index) {
                updateDisposition(character, index);
                expect(character.system.currentDisposition).toStrictEqual(index);
                expect(
                    getTransformation(character, "modifiers", "persuasion", false, true).total
                ).toStrictEqual(disposition.persuasionModifier);
                expect(
                    getTransformation(character, "modifiers", "deception", false, true).total
                ).toStrictEqual(disposition.deceptionModifier);
            });
        });
        test("disposition exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            updateDisposition(character, 10);
            expect(character.system["currentDisposition"]).toStrictEqual(0);
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
