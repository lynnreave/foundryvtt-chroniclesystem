import { describe, test, expect } from "@jest/globals";
import {
  Disposition
// @ts-ignore
} from "@type/disposition";

const defaultName: string = "someName";
const defaultRating: number = 1;
const defaultPersuasionModifier: number = 2;
const defaultDeceptionModifier: number = 3;

describe("disposition.js", () => {
  describe("Disposition", () => {
    describe("get name", () => {
      test("call", () => {
        let disposition = new Disposition(
            defaultName, defaultRating, defaultDeceptionModifier, defaultPersuasionModifier
        );
        expect(disposition.name).toStrictEqual(defaultName);
      });
    });
    describe("get rating", () => {
      test("call", () => {
        let disposition = new Disposition(
            defaultName, defaultRating, defaultDeceptionModifier, defaultPersuasionModifier
        );
        expect(disposition.rating).toStrictEqual(defaultRating);
      });
    });
    describe("get deception modifier", () => {
      test("call", () => {
        let disposition = new Disposition(
            defaultName, defaultRating, defaultDeceptionModifier, defaultPersuasionModifier
        );
        expect(disposition.deceptionModifier).toStrictEqual(defaultDeceptionModifier);
      });
    });
    describe("get persuasion modifier", () => {
      test("call", () => {
        let disposition = new Disposition(
            defaultName, defaultRating, defaultDeceptionModifier, defaultPersuasionModifier
        );
        expect(disposition.persuasionModifier).toStrictEqual(defaultPersuasionModifier);
      });
    });
  });
});
