export class Formation {
    #name;
    #difficulty;
    #disciplineModifier;
    #fightingDefenseModifier;
    #marksmanshipDefenseModifier;
    #movementModifier;
    #testDiceModifier;
    #conditionalModifiers;

    constructor(
        name,
        difficulty,
        disciplineModifier,
        fightingDefenseModifier,
        marksmanshipDefenseModifier,
        movementModifier,
        testDiceModifier,
        conditionalModifiers
    ) {
        this.#name = name;
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