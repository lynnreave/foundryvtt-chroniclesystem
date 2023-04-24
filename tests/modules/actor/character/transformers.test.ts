import {
    addTransformer,
    getTransformation,
    removeTransformer,
    saveTransformers,
    transformerTypes,
    updateTempTransformers
// @ts-ignore
} from "@actor/character/transformers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";


const defaultTransformer = {_id: "source", mod: 1, isDocument: false};

describe("transformers.js", () => {
    describe("update temp transformers", () => {
        test("has temp transformer => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            let expected = [testTransformer];
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = [];
                // test
                character.system[type]["someAttr"] = expected;
                updateTempTransformers(character)
                expect(character[type]["someAttr"]).toBe(expected)
                // reset
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
            }
        });
        test("has temp transformer - negative => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character.system[type]["someAttr"] = [];
                // test
                character[type]["someAttr"] = [testTransformer];
                character.system[type]["someAttr"] = [];
                updateTempTransformers(character)
                expect(character[type]["someAttr"]).toStrictEqual([])
                // reset
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
            }
        });
    });
    describe("save transformers", () => {
        test("call => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            let expected = [testTransformer];
            for (let type of transformerTypes) {
                // clean
                character.system[type]["someAttr"] = [];
                // test
                character[type]["someAttr"] = expected;
                saveTransformers(character)
                expect(character.system[type]["someAttr"]).toBe(expected)
                // reset
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
            }
        });
    });
    describe("remove transformer", () => {
        test("has transformer => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                // test
                character[type]["someAttr"] = [testTransformer];
                removeTransformer(character, type, "someAttr", testTransformer._id)
                expect(character[type]["someAttr"]).toStrictEqual([])
                // reset
            }
        });
        test("has transformer - negative => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                // test
                character[type]["someAttr"] = [];
                removeTransformer(character, type, "someAttr", testTransformer._id)
                expect(character[type]["someAttr"]).toStrictEqual([])
                // reset
            }
        });
        test("save => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                // test
                character[type]["someAttr"] = [testTransformer];
                character.system[type]["someAttr"] = [testTransformer];
                removeTransformer(character, type, "someAttr", testTransformer._id, true)
                expect(character[type]["someAttr"]).toStrictEqual([])
                expect(character.system[type]["someAttr"]).toStrictEqual([])
                // reset
            }
        });
        test("save - negative => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                // test
                character[type]["someAttr"] = [testTransformer];
                character.system[type]["someAttr"] = [testTransformer];
                removeTransformer(character, type, "someAttr", testTransformer._id, false)
                expect(character[type]["someAttr"]).toStrictEqual([])
                expect(character.system[type]["someAttr"]).toStrictEqual([testTransformer])
                // reset
            }
        });
        test("multiple transformers => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            let anotherTransformer = {_id: "source2", mod: 1, isDocument: false};
            let someTransformer = {_id: "source3", mod: 1, isDocument: false};
            for (let type of transformerTypes) {
                // clean
                // test
                character[type]["someAttr"] = [testTransformer, anotherTransformer, someTransformer]
                removeTransformer(character, type, "someAttr", testTransformer._id)
                expect(character[type]["someAttr"]).toStrictEqual([anotherTransformer, someTransformer])
                // reset
            }
        });
    });
    describe("add transformer", () => {
        test("new transformer => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                // test
                addTransformer(
                    character, type, "someAttr", testTransformer._id, testTransformer.mod, false
                );
                expect(character[type]["someAttr"]).toStrictEqual([testTransformer]);
                // reset
                character[type]["someAttr"] = null;
            }
        });
        test("existing transformer => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                // test
                character[type]["someAttr"] = [testTransformer];
                let expected = {
                    _id: "source", mod: testTransformer.mod + 1, isDocument: false
                };
                addTransformer(character, type, "someAttr", expected._id, expected.mod, false);
                expect(character[type]["someAttr"]).toStrictEqual([expected]);
                // reset
                character[type]["someAttr"] = [];
            }
        });
        test("doc transformer => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                // test
                let expected = {
                    _id: "source", mod: testTransformer.mod, isDocument: true
                };
                addTransformer(
                    character, type, "someAttr", testTransformer._id, testTransformer.mod,
                );
                expect(character[type]["someAttr"]).toStrictEqual([expected]);
                // reset
                character[type]["someAttr"] = null;
            }
        });
        test("save => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
                // test
                addTransformer(
                    character, type, "someAttr", testTransformer._id, testTransformer.mod, false, true
                );
                expect(character[type]["someAttr"]).toStrictEqual([testTransformer]);
                expect(character.system[type]["someAttr"]).toStrictEqual([testTransformer]);
                // reset
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
            }
        });
        test("save - negative => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
                // test
                addTransformer(
                    character, type, "someAttr", testTransformer._id, testTransformer.mod, false, false
                );
                expect(character[type]["someAttr"]).toStrictEqual([testTransformer]);
                expect(character.system[type]["someAttr"]).toStrictEqual([]);
                // reset
                character[type]["someAttr"] = [];
                character.system[type]["someAttr"] = [];
            }
        });
    });
    describe("get transformation", () => {
        test("none => type", () => {
            let character: TestCharacter = new TestCharacter()
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
                // test
                let output = getTransformation(character, type, "someAttr");
                expect(output.total).toBe(0);
                // reset
            }
        });
        test("one => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
                // test
                character.system[type]["someAttr"] = [testTransformer];
                let output = getTransformation(character, type, "someAttr");
                expect(output.total).toBe(testTransformer.mod);
                // reset
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
            }
        });
        test("many => type", () => {
            let character: TestCharacter = new TestCharacter()
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
                // test
                character.system[type]["someAttr"] = [
                    {_id: "source1", mod: 1, isDocument: false},
                    {_id: "source2", mod: 2, isDocument: false},
                    {_id: "source3", mod: 3, isDocument: false}
                ];
                let output = getTransformation(character, type, "someAttr");
                expect(output.total).toBe(6);
                // reset
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
            }
        });
        test("include detail => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
                // test
                character.system[type]["someAttr"] = [testTransformer];
                let output = getTransformation(character, type, "someAttr", true);
                expect(output.total).toBe(testTransformer.mod);
                expect(output.detail).toStrictEqual([{docName: undefined, mod: testTransformer.mod}]);
                // reset
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
            }
        });
        test("include detail doc => type", () => {
            let character: TestCharacter = new TestCharacter()
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
                // test
                let itemDoc = {_id: "source", name: "sourceName"};
                character.owned["someType"] = [itemDoc];
                let transformer = {_id: itemDoc._id, mod: 1, isDocument: true};
                character.system[type]["someAttr"] = [transformer];
                let output = getTransformation(character, type, "someAttr", true);
                expect(output.total).toBe(transformer.mod);
                expect(output.detail).toStrictEqual([{docName: itemDoc.name, mod: transformer.mod}]);
                // reset
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
            }
        });
        test("include globals => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            let anotherTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character[type]["all"] = null;
                character.system[type]["someAttr"] = null;
                character.system[type]["all"] = null;
                // test
                character.system[type]["someAttr"] = [testTransformer];
                character.system[type]["all"] = [anotherTransformer];
                let output = getTransformation(character, type, "someAttr", false, true);
                expect(output.total).toBe(testTransformer.mod + anotherTransformer.mod);
                // reset
                character[type]["someAttr"] = null;
                character[type]["all"] = null;
                character.system[type]["someAttr"] = null;
                character.system[type]["all"] = null;
            }
        });
        test("include globals - negative => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            let anotherTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character[type]["all"] = null;
                character.system[type]["someAttr"] = null;
                character.system[type]["all"] = null;
                // test
                character.system[type]["someAttr"] = [testTransformer];
                character.system[type]["all"] = [anotherTransformer];
                let output = getTransformation(character, type, "someAttr", false, false);
                expect(output.total).toBe(testTransformer.mod);
                // reset
                character[type]["someAttr"] = null;
                character[type]["all"] = null;
                character.system[type]["someAttr"] = null;
                character.system[type]["all"] = null;
            }
        });
    });
});
