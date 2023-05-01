import { describe, test, expect } from "@jest/globals";
import {
  refreshEmbeddedActorData
// @ts-ignore
} from "@actor/character/helpers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestGame } from "@mocks/game";

const defaultHeroItem = {
  _id: "someId", name: "someName", type: "hero", img: "/some/img/path/", system: {targetId: null}
};

describe("helpers.js", () => {
  describe("function", () => {
    test("testcase", () => {
      let unit: TestCharacter = new TestCharacter();
      let character: TestCharacter = new TestCharacter();
      character.id = "characterId";
      character.name = "characterName";
      character.img = "/char/img/path"
      global.game = new TestGame();
      global.game.actors = new Map();
      global.game.actors.set(character.id, character)
      let heroDoc = Object.assign({}, defaultHeroItem);
      heroDoc.system.targetId = character.id
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
