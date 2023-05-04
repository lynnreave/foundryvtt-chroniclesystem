import { describe, test, expect } from "@jest/globals";
import {
  onEquippedChanged
// @ts-ignore
} from "@item/effect/helpers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
import {
  addTransformer,
  getTransformation,
  saveTransformers,
  transformerTypes
// @ts-ignore
} from "@actor/character/transformers";

const defaultEffect = {
  _id: "someEffectId", name: "someEffectName",
  system: {isActive: true, transformations: []}
};

describe("helpers.js", () => {
  describe("onEquippedChange", () => {
    test("equipping", () => {
      let character: TestCharacter = new TestCharacter();
      let effect = Object.assign({}, defaultEffect);
      let transformation = {target: "some_attr"};
      let expected = {}
      for (let type of transformerTypes) {
        expected[type] = 1;
        transformation[type] = 1;
      }
      effect.system.transformations.push(transformation);
      effect.system.isActive = false;
      onEquippedChanged(effect, character, true);
      saveTransformers(character);
      let actual = {}
      for (let type of transformerTypes) {
        actual[type] = getTransformation(character, type, "some_attr", false, true).total;
      }
      expect(actual).toStrictEqual(expected);
    });
    test("unequipping", () => {
      let character: TestCharacter = new TestCharacter();
      let effect = Object.assign({}, defaultEffect);
      let transformation = {target: "some_attr"};
      let expected = {}
      for (let type of transformerTypes) {
        expected[type] = 0;
        transformation[type] = 1;
        addTransformer(
            character, type, transformation.target, effect._id, transformation[type], false
        );
      }
      saveTransformers(character);
      effect.system.transformations.push(transformation);
      onEquippedChanged(effect, character, false);
      saveTransformers(character);
      let actual = {}
      for (let type of transformerTypes) {
        actual[type] = getTransformation(character, type, "some_attr", false, true).total;
      }
      expect(actual).toStrictEqual(expected);
    });
  });
});
