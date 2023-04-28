export class UnitStatus {
    #name;

    constructor(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }
}
