export class UnitFacing {
    #name;
    #testDiceModifier;
    #bonusDiceModifier;

    constructor(name, testDiceModifier, bonusDiceModifier) {
        this.#name = name;
        this.#testDiceModifier = testDiceModifier;
        this.#bonusDiceModifier = bonusDiceModifier;
    }

    get name() {
        return this.#name;
    }

    get testDiceModifier() {
        return this.#testDiceModifier;
    }

    get bonusDiceModifier() {
        return this.#bonusDiceModifier;
    }
}