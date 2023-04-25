import { describe, test, expect } from "@jest/globals";
// import {
//   getAbilityTestFormula, getFormula
// @ts-ignore
// } from "@roll/rolls";
// @ts-ignore
// import { TestCharacter } from "@mocks/character";

const defaultTestObject = {};

describe("test.js", () => {
  describe("function", () => {
    test("testcase", () => {
      // let character: TestCharacter = new TestCharacter();
      let testObject = Object.assign({}, defaultTestObject);
      expect(testObject).toStrictEqual({});
    });
  });
});
