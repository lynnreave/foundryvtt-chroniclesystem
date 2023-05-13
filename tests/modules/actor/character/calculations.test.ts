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
import {
  addTransformer
// @ts-ignore
} from "@actor/character/transformers";

global.game = new TestGame();

describe("calculations.js", () => {
  describe("calculate combat defense", () => {
    test("call", () => {
      global.game.settings = TestSettingsSystemASOIAFTrue;
      let character: TestCharacter = new TestCharacter();
      let output = calculateCombatDefense(character);
      expect(output).toStrictEqual(6);
    });
    test("minimum", () => {
      global.game.settings = TestSettingsSystemASOIAFTrue;
      let character: TestCharacter = new TestCharacter();
      addTransformer(character, "modifiers", "combat_defense", "someSource", -6, false, true);
      let output = calculateCombatDefense(character);
      expect(output).toStrictEqual(1);
    });
    test("ignore agility", () => {
      global.game.settings = TestSettingsSystemASOIAFTrue;
      let character: TestCharacter = new TestCharacter();
      character.system.ignoreCombatDefenseAgility = true;
      let output = calculateCombatDefense(character);
      expect(output).toStrictEqual(4);
    });
    test("override", () => {
      global.game.settings = TestSettingsSystemASOIAFTrue;
      let character: TestCharacter = new TestCharacter();
      character.system.derivedStats.combatDefense.override = true;
      character.system.derivedStats.combatDefense.overrideValue = 10;
      let output = calculateCombatDefense(character);
      expect(output).toStrictEqual(10);
    });
  });
  describe("calculate movement data", () => {
    test("call", () => {
      let character: TestCharacter = new TestCharacter();
      calculateMovementData(character);
      expect(character.system.movement.total).toStrictEqual(DEFAULT_MOVEMENT);
    });
    test("run specialty", () => {
      let character: TestCharacter = new TestCharacter();
      let specialty = {name: 'run', rating: 2, modifier: 1};
      let abilityDoc = {
        _id: "someId", name: "Athletics", type: "ability", system: {
          rating: 5, modifier: 0, specialties: [specialty]
        }
      }
      character.owned.abilities = [abilityDoc];
      calculateMovementData(character);
      expect(character.system.movement.total).toStrictEqual(DEFAULT_MOVEMENT+1);
    });
    test("1 athletics", () => {
      let character: TestCharacter = new TestCharacter();
      let abilityDoc = {
        _id: "someId", name: "Athletics", type: "ability", system: {
          rating: 1, modifier: 0, specialties: []
        }
      }
      character.owned.abilities = [abilityDoc];
      calculateMovementData(character);
      expect(character.system.movement.total).toStrictEqual(DEFAULT_MOVEMENT-1);
    });
    test("1 athletics 1 run", () => {
      let character: TestCharacter = new TestCharacter();
      let specialty = {name: 'run', rating: 1, modifier: 1};
      let abilityDoc = {
        _id: "someId", name: "Athletics", type: "ability", system: {
          rating: 1, modifier: 0, specialties: [specialty]
        }
      }
      character.owned.abilities = [abilityDoc];
      calculateMovementData(character);
      expect(character.system.movement.total).toStrictEqual(DEFAULT_MOVEMENT);
    });
  });
});
