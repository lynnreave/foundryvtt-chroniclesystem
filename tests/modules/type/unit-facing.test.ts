import { describe, test, expect } from "@jest/globals";
import {
  UnitFacing
// @ts-ignore
} from "@type/unit-facing";

const defaultName: string = "someName";
const defaultTestDiceModifier: number = 2;
const defaultBonusDiceModifier: number = 3;

describe("unit-facing.js", () => {
  describe("UnitFacing", () => {
    describe("get attributes", () => {
      test("call", () => {
        let testUnitFacing = new UnitFacing(
            defaultName, defaultTestDiceModifier, defaultBonusDiceModifier
        );
        expect(testUnitFacing.name).toStrictEqual(defaultName);
        expect(testUnitFacing.testDiceModifier).toStrictEqual(defaultTestDiceModifier);
        expect(testUnitFacing.bonusDiceModifier).toStrictEqual(defaultBonusDiceModifier);
      });
    });
  });
});
