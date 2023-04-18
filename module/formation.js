export class Formation {
    #name;
    #rating;
    #difficulty;
    #disciplineModifier;
    #fightingDefenseModifier;
    #marksmanshipDefenseModifier;
    #movementModifier;
    #testDiceModifier;
    #conditionalModifiers;

    constructor(
        name,
        rating,
        difficulty,
        disciplineModifier,
        fightingDefenseModifier,
        marksmanshipDefenseModifier,
        movementModifier,
        testDiceModifier,
        conditionalModifiers
    ) {
        this.#name = name;
        this.#rating = rating;
        this.#difficulty = difficulty;
        this.#disciplineModifier = disciplineModifier;
        this.#fightingDefenseModifier = fightingDefenseModifier;
        this.#marksmanshipDefenseModifier = marksmanshipDefenseModifier;
        this.#movementModifier = movementModifier;
        this.#testDiceModifier = testDiceModifier;
        this.#conditionalModifiers = conditionalModifiers;
    }

    get name() {
        return this.#name;
    }

    get rating() {
        return this.#rating;
    }

    get difficulty() {
        return this.#difficulty;
    }

    get disciplineModifier() {
        return this.#disciplineModifier;
    }

    get fightingDefenseModifier() {
        return this.#fightingDefenseModifier;
    }

    get marksmanshipDefenseModifier() {
        return this.#marksmanshipDefenseModifier;
    }

    get movementModifier() {
        return this.#movementModifier;
    }

    get testDiceModifier() {
        return this.#testDiceModifier;
    }

    get conditionalModifiers() {
        return this.#conditionalModifiers;
    }
}