export class UnitFacing {
    #name;
    #rating;
    #testDiceModifier;
    #bonusDiceModifier;

    constructor(name, rating, testDiceModifier, bonusDiceModifier) {
        this.#name = name;
        this.#rating = rating;
        this.#testDiceModifier = testDiceModifier;
        this.#bonusDiceModifier = bonusDiceModifier;
    }

    get name() {
        return this.#name;
    }

    get rating() {
        return this.#rating;
    }

    get testDiceModifier() {
        return this.#testDiceModifier;
    }

    get bonusDiceModifier() {
        return this.#bonusDiceModifier;
    }
}