import { describe, test, expect } from "@jest/globals";
import {
  UnitStatus
// @ts-ignore
} from "@type/unit-status";

const defaultName: string = "someName";

describe("unit-status.js", () => {
  describe("UnitStatus", () => {
    describe("get attributes", () => {
      test("call", () => {
        let testUnitStatus = new UnitStatus(defaultName);
        expect(testUnitStatus.name).toStrictEqual(defaultName);
      });
    });
  });
});
