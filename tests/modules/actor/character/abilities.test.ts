import {
    getAbilities, getAbility, getAbilityBySpecialty, getAbilityValue
// @ts-ignore
} from "@actor/character/abilities";
// @ts-ignore
import { TestCharacter } from "@mocks/character";

const defaultAbility = {
    _id: "someId", name: "someName", type: "ability", system: {rating: 5}
};
const defaultSpecialty = {name: 'someName', rating: 1, modifier: null};

describe("abilities.js", () => {
    describe("get abilities", () => {
        test("call", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let output = getAbilities(character);
            expect(output).toStrictEqual([abilityDoc]);
        });
    });
    describe("get ability", () => {
        test("ability exists", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let output = getAbility(character, abilityDoc.name);
            expect(output).toStrictEqual([abilityDoc, undefined]);
        });
        test("ability exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [];
            let output = getAbility(character, abilityDoc.name);
            expect(output).toStrictEqual([undefined, undefined]);
        });
    });
    describe("get ability by speciality", () => {
        test("specialty exists", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            let specialty = Object.assign({}, defaultSpecialty)
            abilityDoc.system["specialties"] = [specialty];
            character.owned.abilities = [abilityDoc];
            let output = getAbilityBySpecialty(character, abilityDoc.name, specialty.name);
            expect(output).toStrictEqual([abilityDoc, specialty]);
        });
        test("specialty exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            abilityDoc.system["specialties"] = []
            character.owned.abilities = [abilityDoc];
            let output = getAbilityBySpecialty(character, abilityDoc.name);
            expect(output).toStrictEqual([undefined, undefined]);
        });
        test("specialties undefined", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            abilityDoc.system["specialties"] = undefined
            character.owned.abilities = [abilityDoc];
            let output = getAbilityBySpecialty(character, abilityDoc.name);
            expect(output).toStrictEqual([undefined, null]);
        });
    });
    describe("get ability value", () => {
        test("ability exists", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [abilityDoc];
            let output = getAbilityValue(character, abilityDoc.name);
            expect(output).toStrictEqual(abilityDoc.system.rating);
        });
        test("ability exists - negative", () => {
            let character: TestCharacter = new TestCharacter();
            let abilityDoc = Object.assign({}, defaultAbility)
            character.owned.abilities = [];
            let output = getAbilityValue(character, abilityDoc.name);
            expect(output).toStrictEqual(2);
        });
    });
});
