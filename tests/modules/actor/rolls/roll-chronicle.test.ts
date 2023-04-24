// @ts-ignore
// import { RollChronicle } from "@roll/roll-chronicle";
// @ts-ignore
import { DiceRollFormula } from "@roll/dice-roll-formula";
// @ts-ignore
import { TestCharacter } from "@mocks/character";
// @ts-ignore
import { TestDie } from "@mocks/roll";
// @ts-ignore
import { TestOperatorTerm, TestNumericTerm } from "@mocks/terms";

// TODO: figure out a way to test this without a dozen mocks; break up the RollChronicle class?
describe("roll-chronicle.js", () => {
    describe("RollChronicle", () => {
        describe("do roll", () => {
            test("call", () => {
                let formula = new DiceRollFormula();
                // let roll = new RollChronicle("someTitle", formula);
                let character: TestCharacter = new TestCharacter();
                global.Die = TestDie;
                global.OperatorTerm = TestOperatorTerm;
                global.NumericTerm = TestNumericTerm;
                // console.log(roll.doRoll(character, false));
            });
        });
    });
});