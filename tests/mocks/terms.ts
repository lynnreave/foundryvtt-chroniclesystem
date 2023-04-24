/**
 * An OperatorTerm mock for use in testing.
 */
export class TestOperatorTerm {
    operator;

    constructor(data) {
        /**
         * @param {object} data: includes the following entries:
         *  "operator": {string} the operator.
         */

        this.operator = data.operator;
    }

    evaluate() {}
}

/**
 * An NumericTerm mock for use in testing.
 */
export class TestNumericTerm {
    number;

    constructor(data) {
        /**
         * @param {object} data: includes the following entries:
         *  "number": {string} the number.
         */

        this.number = data.number;
    }

    evaluate() {}
}