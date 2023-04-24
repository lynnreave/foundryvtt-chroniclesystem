// @ts-ignore
import { DiceRollFormula } from "@roll/dice-roll-formula";

describe("dice-roll-formula.js", () => {
    describe("DiceRollFormula", () => {
        describe("is user changed", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                expect(formula.isUserChanged).toStrictEqual(false);
            });
        });
        describe("difficult", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                expect(formula.difficult).toStrictEqual(0);
            });
        });
        describe("re-roll", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                formula.reRoll = 0;
                expect(formula.reRoll).toStrictEqual(0);
            });
        });
        describe("to string", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                formula.reRoll = 0;
                expect(formula.toStr()).toStrictEqual("2|0|0|0|0");
            });
        });
        describe("from string", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                let formulaFromStr = DiceRollFormula.fromStr("2|0|0|0|0")
                expect(formulaFromStr).toStrictEqual(formula);
            });
        });
        describe("to formatted string", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                expect(formula.ToFormattedStr()).toStrictEqual("2d6");
            });
            test("w/ test dice", () => {
                let formula = new DiceRollFormula();
                formula.pool = 5;
                expect(formula.ToFormattedStr()).toStrictEqual(`${formula.pool}d6`);
            });
            test("w/ bonus dice", () => {
                let formula = new DiceRollFormula();
                formula.bonusDice = 5;
                expect(formula.ToFormattedStr()).toStrictEqual("2d6 + 5B");
            });
            test("w/ modifier > 0", () => {
                let formula = new DiceRollFormula();
                formula.modifier = 5;
                expect(formula.ToFormattedStr()).toStrictEqual("2d6 + 5");
            });
            test("w/ modifier < 0", () => {
                let formula = new DiceRollFormula();
                formula.modifier = -5;
                expect(formula.ToFormattedStr()).toStrictEqual("2d6 - 5");
            });
        });
    });
});