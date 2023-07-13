import {
    addTransformer,
    getAllTransformers,
    getTransformation,
    removeTransformer,
    removeAllTransformersFromSource,
    saveTransformers,
    transformerTypes,
    updateTempTransformers
// @ts-ignore
} from "@actor/character/transformers";
// @ts-ignore
import { TestCharacter } from "@mocks/character";


const defaultTransformer = {_id: "source", mod: 1, isDocument: false};

describe("transformers.js", () => {
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
    describe("get all transformations", () => {
        test("none", () => {
            let character: TestCharacter = new TestCharacter();
            let output = getAllTransformers(character);
            expect(output).toStrictEqual({});
        });
        test("one => type", () => {
            let character: TestCharacter = new TestCharacter();
            let testTransformer = Object.assign({}, defaultTransformer);
            let expected: object = {};
            expected[testTransformer._id] = {name: "", someAttr: {}}
            for (let type of transformerTypes) {
                character.system[type]["someAttr"] = [testTransformer];
                expected[testTransformer._id]["someAttr"][type] = testTransformer.mod;
            }
            let output = getAllTransformers(character);
            expect(output).toStrictEqual(expected);
        });
        test("many => type", () => {
            let character: TestCharacter = new TestCharacter();
            let transformer1 = {_id: "source1", mod: 1, isDocument: false};
            let transformer2 = {_id: "source2", mod: 2, isDocument: false};
            let transformer3 = {_id: "source3", mod: 3, isDocument: false};
            let expected: object = {};
            expected[transformer1._id] = {name: "", someAttr: {}}
            expected[transformer2._id] = {name: "", someAttr: {}}
            expected[transformer3._id] = {name: "", someAttr: {}}
            for (let type of transformerTypes) {
                character.system[type]["someAttr"] = [transformer1, transformer2, transformer3];
                expected[transformer1._id]["someAttr"][type] = transformer1.mod;
                expected[transformer2._id]["someAttr"][type] = transformer2.mod;
                expected[transformer3._id]["someAttr"][type] = transformer3.mod;
            }
            let output = getAllTransformers(character);
            expect(output).toStrictEqual(expected);
        });
        test("doc source => type", () => {
            let character: TestCharacter = new TestCharacter();
            let embeddedItem = {_id: "source", name: "someName"}
            character.owned["armor"] = [embeddedItem];
            let testTransformer = {_id: embeddedItem._id, mod: 1, isDocument: true};
            let expected: object = {};
            expected[testTransformer._id] = {name: embeddedItem.name, someAttr: {}}
            for (let type of transformerTypes) {
                character.system[type]["someAttr"] = [testTransformer];
                expected[testTransformer._id]["someAttr"][type] = testTransformer.mod;
            }
            let output = getAllTransformers(character);
            expect(output).toStrictEqual(expected);
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
            let character: TestCharacter = new TestCharacter();
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
            let character: TestCharacter = new TestCharacter();
            let testTransformer = {_id: "source", mod: 1, isDocument: false};
            for (let type of transformerTypes) {
                // clean
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
                // test
                character.system[type]["someAttr"] = [testTransformer];
                let output = getTransformation(character, type, "someAttr", true);
                expect(output.total).toBe(testTransformer.mod);
                expect(output.detail).toStrictEqual(
                    [{docName: undefined, mod: testTransformer.mod, source: testTransformer._id}]
                );
                // reset
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
            }
        });
        test("include detail doc => type", () => {
            let character: TestCharacter = new TestCharacter();
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
                expect(output.detail).toStrictEqual(
                    [{docName: itemDoc.name, mod: transformer.mod, source: transformer._id}]
                );
                // reset
                character[type]["someAttr"] = null;
                character.system[type]["someAttr"] = null;
            }
        });
        test("include globals => type", () => {
            let character: TestCharacter = new TestCharacter();
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
            let character: TestCharacter = new TestCharacter();
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
        test("multi-word name => type", () => {
            let character: TestCharacter = new TestCharacter()
            let testTransformer = Object.assign({}, defaultTransformer);
            for (let type of transformerTypes) {
                // clean
                character[type]["some_attr"] = null;
                character.system[type]["some_attr"] = null;
                // test
                character.system[type]["some_attr"] = [testTransformer];
                let output = getTransformation(character, type, "some attr");
                expect(output.total).toBe(testTransformer.mod);
                // reset
                character[type]["some_attr"] = null;
                character.system[type]["some_attr"] = null;
            }
        });
    });
    describe("remove all transformers from source", () => {
        test("call => type", () => {
            let character: TestCharacter = new TestCharacter()
            let transformer1 = {_id: "1", mod: 1, isDocument: false};
            let transformer2 = {_id: "2", mod: 2, isDocument: false};
            let transformer3 = {_id: "3", mod: 3, isDocument: false};
            for (let type of transformerTypes) {
                character[type]["attr1"] = [transformer1]
                character[type]["attr2"] = [transformer1, transformer2]
                character[type]["attr3"] = [transformer1, transformer2, transformer3]
            }
            removeAllTransformersFromSource(character, transformer1._id)
            for (let type of transformerTypes) {
                expect(character[type]["attr1"]).toStrictEqual([])
                expect(character[type]["attr2"]).toStrictEqual([transformer2])
                expect(character[type]["attr3"]).toStrictEqual([transformer2, transformer3])
            }
        });
        test("save => type", () => {
            let character: TestCharacter = new TestCharacter()
            let transformer1 = {_id: "1", mod: 1, isDocument: false};
            let transformer2 = {_id: "2", mod: 2, isDocument: false};
            let transformer3 = {_id: "3", mod: 3, isDocument: false};
            for (let type of transformerTypes) {
                character[type]["attr1"] = [transformer1]
                character[type]["attr2"] = [transformer1, transformer2]
                character[type]["attr3"] = [transformer1, transformer2, transformer3]
            }
            removeAllTransformersFromSource(character, transformer1._id, true)
            for (let type of transformerTypes) {
                expect(character[type]["attr1"]).toStrictEqual([])
                expect(character.system[type]["attr1"]).toStrictEqual([])
                expect(character[type]["attr2"]).toStrictEqual([transformer2])
                expect(character.system[type]["attr2"]).toStrictEqual([transformer2])
                expect(character[type]["attr3"]).toStrictEqual([transformer2, transformer3])
                expect(character.system[type]["attr3"]).toStrictEqual([transformer2, transformer3])
            }
        });
        test("save - negative => type", () => {
            let character: TestCharacter = new TestCharacter()
            let transformer1 = {_id: "1", mod: 1, isDocument: false};
            let transformer2 = {_id: "2", mod: 2, isDocument: false};
            let transformer3 = {_id: "3", mod: 3, isDocument: false};
            for (let type of transformerTypes) {
                character[type]["attr1"] = [transformer1]
                character[type]["attr2"] = [transformer1, transformer2]
                character[type]["attr3"] = [transformer1, transformer2, transformer3]
            }
            removeAllTransformersFromSource(character, transformer1._id, false)
            for (let type of transformerTypes) {
                expect(character[type]["attr1"]).toStrictEqual([])
                expect(character.system[type]["attr1"]).toStrictEqual(undefined)
                expect(character[type]["attr2"]).toStrictEqual([transformer2])
                expect(character.system[type]["attr2"]).toStrictEqual(undefined)
                expect(character[type]["attr3"]).toStrictEqual([transformer2, transformer3])
                expect(character.system[type]["attr3"]).toStrictEqual(undefined)
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
});
