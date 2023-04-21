export class UnitStatus {
    #name;
    #rating;

    constructor(name, rating) {
        this.#name = name;
        this.#rating = rating;
    }

    get name() {
        return this.#name;
    }

    get rating() {
        return this.#rating;
    }
}