import {
    getData
// @ts-ignore
} from "@module/common"
// @ts-ignore
import { TestCharacter } from "@mocks/character";

describe("common.js", () => {
    describe("get data", () => {
        test("call", () => {
            let character: TestCharacter = new TestCharacter();
            let output = getData(character);
            expect(output).toStrictEqual(character.system);
        });
    });
});
