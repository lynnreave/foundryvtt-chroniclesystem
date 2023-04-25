import { describe, test, expect } from "@jest/globals";
import {
  calculateCombatDefense,
  calculateMovementData
// @ts-ignore
} from "@actor/character/calculations";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestGame, TestSettingsSystemASOIAFTrue } from "@mocks/game";
import {
  DEFAULT_MOVEMENT
// @ts-ignore
} from "@module/constants";

global.game = new TestGame();

describe("calculations.js", () => {
  describe("calculate combat defense", () => {
    test("call", () => {
      global.game.settings = TestSettingsSystemASOIAFTrue;
      let character: TestCharacter = new TestCharacter();
      let output = calculateCombatDefense(character);
      expect(output).toStrictEqual(6);
    });
  });
  describe("calculate movement data", () => {
    test("call", () => {
      let character: TestCharacter = new TestCharacter();
      calculateMovementData(character);
      expect(character.system.movement.total).toStrictEqual(DEFAULT_MOVEMENT);
    });
  });
});
