import { describe, test, expect } from "@jest/globals";
import {
  Formation
// @ts-ignore
} from "@type/formation";

const defaultName: string = "someName";
const defaultDifficulty: number = 2;
const defaultDisciplineModifier: number = 3;
const defaultFightingDefenseModifier: number = 4;
const defaultMarksmanshipDefenseModifier: number = 5;
const defaultMovementModifier: number = 6;
const defaultTestDiceModifier: number = 7;
const defaultConditionalModifiers: number = 8;


describe("formation.js", () => {
  describe("Formation", () => {
    describe("get attributes", () => {
      test("call", () => {
        let testFormation = new Formation(
            defaultName,
            defaultDifficulty,
            defaultDisciplineModifier,
            defaultFightingDefenseModifier,
            defaultMarksmanshipDefenseModifier,
            defaultMovementModifier,
            defaultTestDiceModifier,
            defaultConditionalModifiers
        );
        expect(testFormation.name).toStrictEqual(defaultName);
        expect(testFormation.difficulty).toStrictEqual(defaultDifficulty);
        expect(testFormation.disciplineModifier).toStrictEqual(defaultDisciplineModifier);
        expect(testFormation.fightingDefenseModifier).toStrictEqual(defaultFightingDefenseModifier);
        expect(testFormation.marksmanshipDefenseModifier).toStrictEqual(defaultMarksmanshipDefenseModifier);
        expect(testFormation.movementModifier).toStrictEqual(defaultMovementModifier);
        expect(testFormation.testDiceModifier).toStrictEqual(defaultTestDiceModifier);
        expect(testFormation.conditionalModifiers).toStrictEqual(defaultConditionalModifiers);
      });
    });
  });
});
