import { describe, test, expect } from "@jest/globals";
import {
  getWeaponTestDataForActor,
  refreshEmbeddedActorData
// @ts-ignore
} from "@actor/character/helpers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestGame } from "@mocks/game";
import {
  addTransformer
// @ts-ignore
} from "@actor/character/transformers";
import {
  CHARACTER_ATTR_CONSTANTS,
  EQUIPPED_CONSTANTS
// @ts-ignore
} from "@module/constants";

const defaultHeroItem = {
  _id: "someId", name: "someName", type: "hero", img: "/some/img/path/", system: {targetId: null}
};
const defaultAbility = {
  _id: "someId", name: "someName", type: "ability", system: {rating: 5, modifier: 0}
};
const defaultSpecialty = {name: 'someName', rating: 1, modifier: 1};
const defaultWeapon = {
  _id: "someId", name: "someName", type: "weapon", damageValue: 3, system: {}
};

describe("helpers.js", () => {
  describe("get weapon test data for actor", () => {
    test("call", () => {
      let character: TestCharacter = new TestCharacter();
      let specialty = {name: 'Swords', rating: 1, modifier: 1};
      let abilityDoc = {
        _id: "someId", name: "Fighting", type: "ability", system: {
          rating: 5, modifier: 0, specialties: [specialty]
        }
      }
      character.owned.abilities = [abilityDoc];
      let weaponDoc = {
        name: "Sword", damageValue: null, formula: null, system: {
          specialty: `${abilityDoc.name}:${specialty.name}`, damage: `@${abilityDoc.name}`
        }
      };
      getWeaponTestDataForActor(character, weaponDoc);
      expect(weaponDoc.formula.ToFormattedStr()).toStrictEqual(
          `${abilityDoc.system.rating}d6 + ${specialty.rating}B + ${specialty.modifier}`
      );
      expect(weaponDoc.damageValue).toStrictEqual(abilityDoc.system.rating);
    });
    test("no specialty ability", () => {
      let character: TestCharacter = new TestCharacter();
      let weaponDoc = {
        name: "someName", damageValue: null, formula: null, system: {specialty: ""}
      };
      getWeaponTestDataForActor(character, weaponDoc);
      expect(weaponDoc.formula.toStr()).toStrictEqual("2|0|0|0|0");
      expect(weaponDoc.damageValue).toStrictEqual(2);
    });
    test("no specialty specialty", () => {
      let character: TestCharacter = new TestCharacter();
      let specialty = {name: 'Swords', rating: 1, modifier: 1};
      let abilityDoc = {
        _id: "someId", name: "Fighting", type: "ability", system: {
          rating: 5, modifier: 0, specialties: [specialty]
        }
      }
      character.owned.abilities = [abilityDoc];
      let weaponDoc = {
        name: "Sword", damageValue: null, formula: null, system: {
          specialty: `${abilityDoc.name}`, damage: `@${abilityDoc.name}`
        }
      };
      getWeaponTestDataForActor(character, weaponDoc);
      expect(weaponDoc.formula.ToFormattedStr()).toStrictEqual(`${abilityDoc.system.rating}d6`);
      expect(weaponDoc.damageValue).toStrictEqual(abilityDoc.system.rating);
    });
    test("has powerful trait", () => {
      global.game = new TestGame();
      let character: TestCharacter = new TestCharacter();
      let swordSpecialty = {name: 'Swords', rating: 1, modifier: 1};
      let fightingDoc = {
        _id: "someId", name: "Fighting", type: "ability", system: {
          rating: 5, modifier: 0, specialties: [swordSpecialty]
        }
      }
      let strengthSpecialty = {name: 'Strength', rating: 2, modifier: 1};
      let athleticsDoc = {
        _id: "someId", name: "Athletics", type: "ability", system: {
          rating: 4, modifier: 0, specialties: [strengthSpecialty]
        }
      }
      character.owned.abilities = [fightingDoc, athleticsDoc];
      let weaponDoc = {
        name: "Sword", damageValue: null, formula: null, system: {
          specialty: `${fightingDoc.name}:${swordSpecialty.name}`, damage: `@${fightingDoc.name}`,
          isPowerful: true
        }
      };
      getWeaponTestDataForActor(character, weaponDoc);
      expect(weaponDoc.formula.ToFormattedStr()).toStrictEqual(
          `${fightingDoc.system.rating}d6 + ${swordSpecialty.rating}B + ${swordSpecialty.modifier}`
      );
      expect(weaponDoc.damageValue).toStrictEqual(
          fightingDoc.system.rating+strengthSpecialty.rating
      );
    });
    test("base damage modifier", () => {
      let character: TestCharacter = new TestCharacter();
      let specialty = {name: 'Swords', rating: 1, modifier: 1};
      let abilityDoc = {
        _id: "someId", name: "Fighting", type: "ability", system: {
          rating: 5, modifier: 0, specialties: [specialty]
        }
      }
      character.owned.abilities = [abilityDoc];
      let weaponDoc = {
        name: "Sword", damageValue: null, formula: null, system: {
          specialty: `${abilityDoc.name}:${specialty.name}`, damage: `@${abilityDoc.name}`
        }
      };
      addTransformer(
          character, "modifiers", CHARACTER_ATTR_CONSTANTS.BASE_WEAPON_DAMAGE,
          "Charging", 2,
          false, true
      );
      getWeaponTestDataForActor(character, weaponDoc);
      expect(weaponDoc.formula.ToFormattedStr()).toStrictEqual(
          `${abilityDoc.system.rating}d6 + ${specialty.rating}B + ${specialty.modifier}`
      );
      expect(weaponDoc.damageValue).toStrictEqual(abilityDoc.system.rating+2);
    });
    describe("adaptable", () => {
      test("adaptable in one hand", () => {
        global.game = new TestGame();
        let character: TestCharacter = new TestCharacter();
        let swordSpecialty = {name: 'Swords', rating: 1, modifier: 1};
        let fightingDoc = {
          _id: "someId", name: "Fighting", type: "ability", system: {
            rating: 5, modifier: 0, specialties: [swordSpecialty]
          }
        }
        let athleticsDoc = {
          _id: "someId", name: "Athletics", type: "ability", system: {
            rating: 4, modifier: 0, specialties: []
          }
        }
        character.owned.abilities = [fightingDoc, athleticsDoc];
        let weaponDoc = {
          name: "Sword", damageValue: null, formula: null, system: {
            specialty: `${fightingDoc.name}:${swordSpecialty.name}`, damage: `@${fightingDoc.name}`,
            isAdaptable: true, equipped: EQUIPPED_CONSTANTS.MAIN_HAND
          }
        };
        getWeaponTestDataForActor(character, weaponDoc);
        expect(weaponDoc.damageValue).toStrictEqual(fightingDoc.system.rating);
      });
      test("not adaptable in two hands", () => {
        global.game = new TestGame();
        let character: TestCharacter = new TestCharacter();
        let swordSpecialty = {name: 'Swords', rating: 1, modifier: 1};
        let fightingDoc = {
          _id: "someId", name: "Fighting", type: "ability", system: {
            rating: 5, modifier: 0, specialties: [swordSpecialty]
          }
        }
        let athleticsDoc = {
          _id: "someId", name: "Athletics", type: "ability", system: {
            rating: 4, modifier: 0, specialties: []
          }
        }
        character.owned.abilities = [fightingDoc, athleticsDoc];
        let weaponDoc = {
          name: "Sword", damageValue: null, formula: null, system: {
            specialty: `${fightingDoc.name}:${swordSpecialty.name}`, damage: `@${fightingDoc.name}`,
            isAdaptable: false, equipped: EQUIPPED_CONSTANTS.BOTH_HANDS
          }
        };
        getWeaponTestDataForActor(character, weaponDoc);
        expect(weaponDoc.damageValue).toStrictEqual(fightingDoc.system.rating);
      });
      test("adaptable in two hands", () => {
        global.game = new TestGame();
        let character: TestCharacter = new TestCharacter();
        let swordSpecialty = {name: 'Swords', rating: 1, modifier: 1};
        let fightingDoc = {
          _id: "someId", name: "Fighting", type: "ability", system: {
            rating: 5, modifier: 0, specialties: [swordSpecialty]
          }
        }
        let athleticsDoc = {
          _id: "someId", name: "Athletics", type: "ability", system: {
            rating: 4, modifier: 0, specialties: []
          }
        }
        character.owned.abilities = [fightingDoc, athleticsDoc];
        let weaponDoc = {
          name: "Sword", damageValue: null, formula: null, system: {
            specialty: `${fightingDoc.name}:${swordSpecialty.name}`, damage: `@${fightingDoc.name}`,
            isAdaptable: true, equipped: EQUIPPED_CONSTANTS.BOTH_HANDS
          }
        };
        getWeaponTestDataForActor(character, weaponDoc);
        expect(weaponDoc.damageValue).toStrictEqual(fightingDoc.system.rating + 2);
      });
    });
  });
  describe("refresh embedded actor data", () => {
    test("call", () => {
      let unit: TestCharacter = new TestCharacter();
      let character: TestCharacter = new TestCharacter();
      character.id = "characterId";
      character.name = "characterName";
      character.img = "/char/img/path";
      global.game = new TestGame();
      global.game.actors = new Map();
      global.game.actors.set(character.id, character);
      let heroDoc = Object.assign({}, defaultHeroItem);
      heroDoc.system.targetId = character.id;
      unit.owned["heroes"] = [heroDoc];
      refreshEmbeddedActorData(heroDoc);
      expect({
        name: heroDoc.name, img: heroDoc.img
      }).toStrictEqual({
        name: character.name, img: character.img
      })
    });
  });
});
