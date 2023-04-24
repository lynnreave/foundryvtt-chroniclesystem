/**
 * Notes on character "abilities":
 *
 * "abilities": an owned item type that the code base has a built-in expectation for.
 * "ability": a single owned item of this type (item.type = "ability").
 * "speciality": a type of test within an ability that adds bonus dice to a specific test.
 *
 * Currently, ability Items must be created and/or import via compendium.
 * However, the code will assume any ability called for as a default 2 rank if it does not exist in
 * the character Actor owned items.
 * TODO: create a built-in pack with the default ability sets.
 * TODO: evaluate the viability/value of hooks for custom, user-defined abilities within the code.
 *
 */
import { getData } from "../../common.js"

export function getAbilities(character) {
    /**
     * Get all abilities for a character.
     *
     * @param {object} character: a character Actor object.
     * @returns {Array}: an array including all ability docs.
     */

    let items = character.getEmbeddedCollection("Item");
    return items.filter((item) => item.type === "ability");
}

export function getAbility(character, abilityName) {
    /**
     * Get a single ability from character.
     *
     * @param {object} character: a character Actor object.
     * @param {string} abilityName: the name of the ability.
     * @returns {Array}: an array including the ability doc and undefined.
     */

    let items = character.getEmbeddedCollection("Item");
    const ability = items.find(
        (item) =>
            item.name.toLowerCase() === abilityName.toString().toLowerCase() &&
            item.type === "ability"
    );
    return [ability, undefined];
}

export function getAbilityBySpecialty(character, abilityName, specialtyName) {
    /**
     * Get a single ability along with an attached speciality from character.
     *
     * @param {object} character: a character Actor object.
     * @param {string} abilityName: the name of the ability.
     * @param {string} specialtyName: the name of the ability specialty.
     * @returns {Array}: an array including the ability and specialty docs.
     */

    let items = character.getEmbeddedCollection("Item");
    let specialty = null;
    const ability = items
        .filter(
            (item) =>
                item.type === "ability" &&
                item.name.toLowerCase() === abilityName.toString().toLowerCase()
        )
        .find(function (ability) {
            let data = getData(ability);
            if (data.specialties === undefined) return false;

            // convert specialties list to array
            let specialties = data.specialties;
            let specialtiesArray = Object.keys(specialties).map(
                (key) => specialties[key]
            );

            specialty = specialtiesArray.find(
                (specialty) =>
                    specialty.name.toLowerCase() ===
                    specialtyName.toString().toLowerCase()
            );
            if (specialty !== null && specialty !== undefined) {
                return true;
            }
        });

    return [ability, specialty];
}

export function getAbilityValue(character, abilityName) {
    /**
     * Get the rating (test dice value) for an ability from a character.
     *
     * @param {object} character: a character Actor object.
     * @param {string} abilityName: the name of the ability.
     * @returns {number}: the value/rating of the ability OR 2 if no ability found.
     */

    const [ability] = getAbility(character, abilityName);
    return ability !== undefined ? getData(ability).rating : 2;
}