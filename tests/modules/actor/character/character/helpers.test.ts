import { describe, test, expect } from "@jest/globals";
import {
    // getCharacterDisposition,
    updateDisposition
// @ts-ignore
} from "@actor/character/character/helpers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestGame } from "@mocks/game";
import {
    getTransformation
// @ts-ignore
} from "@actor/character/transformers";
// @ts-ignore
import { CHARACTER_DISPOSITIONS } from "@module/selections";

global.game = new TestGame();

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
});
