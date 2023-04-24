/**
 * A Die mock for use in testing.
 */
export class TestDie {
    faces;
    number;
    fixed;

    constructor(data) {
        /**
         * @param {object} data: includes the following entries:
         *  "faces": {number} the number of sides to the die.
         *  "number": {number} the number of dice.
         *  "fixed": {Array} an optional array of roll data of the following format:
         *      {result: 3, active: true}
         */

        this.faces = data.faces;
        this.number = data.number;
        this.fixed = data.fixed;
    }

    evaluate(options: object) {}

    reroll(formula: string) {}

    keep(modifier: string) {}
}

/**
 * A Die mock for use in testing.
 */
export class TestRoll {
    terms;

    constructor(terms) {
        /**
         * @param {Array} terms: includes the following entries:
         *  - {Die} a Die object.
         *  - {OperatorTerm} a OperatorTerm object.
         *  - {NumericTerm} a NumericTerm object.
         */

        this.terms = terms;
    }

    fromTerms() {}
}
