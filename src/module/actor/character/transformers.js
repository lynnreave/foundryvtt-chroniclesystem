/**
 * Notes on Character "transformers":
 *
 * "transformer": any change to the base test dice, bonus dice, or value of an attribute or roll.
 * "transformation": the sum of all changes from a single type of transformer.
 * "poolMods": changes to the test dice of a roll; dice pool modifier; test dice modifier.
 * [DEPRECATING] "penalties": negative changes to the test dice of a roll (use negative poolMods instead).
 * "bonuses": changes to the bonus dice of a roll.
 * "modifiers": flat changes to the outcome of a roll or some attribute value.
 *
 * TODO: roll penalties in poolMods and either remove penalties or calculate dynamically?
 */
import { CHARACTER_ATTR_CONSTANTS } from "../../constants.js";
import { getData } from "../../common.js";

export const transformerTypes = ["poolMods", "penalties", "bonuses", "modifiers"];

function _warnToUpdateTempTransformers(character) {
    /**
     * Warn user to call updateTempTransformers before transformations.
     *
     * @param {object} character: a character Actor object.
     */

    for (let type of transformerTypes) {
        console.assert(
            character[type],
            "call actor.updateTempTransformers before saving the transformation!"
        )
    }
}

export function addTransformer(
    character, type, attr, sourceId, value, isDocument = true, save = false
) {
    /**
     * Add a Character Actor transformer.
     *
     * @param {object} character: a character Actor object.
     * @param {string} type: the type of transformer.
     * @param {string} attr: the type of attribute to update ("all" for all available attributes).
     * @param {string} sourceId: the id of the source of the transformation.
     * @param {number} value: the value of the transformation.
     * @param {boolean} isDocument: whether or not the source is a Document (embedded object type).
     * @param {boolean} save: whether or not to save Actor transformers to temp data after operation.
     */

    _warnToUpdateTempTransformers(character);

    // make sure transformers for attribute are allowed
    if (!character[type][attr]) {
        character[type][attr] = [];
    }

    // get index of attr from existing transformers (if exists)
    let index = character[type][attr].findIndex((trans) => {
        return trans._id === sourceId;
    });

    // add transformer for specified type and attr w/ sourceId
    // if transformer for attr already exists, overwrite it
    if (index >= 0) {
        character[type][attr][index].mod = value;
    // else, add new transformer
    } else {
        character[type][attr].push({
            _id: sourceId,
            mod: value,
            isDocument: isDocument,
        });
    }

    // save (if specified)
    if (save) saveTransformers(character);
}

export function getAllTransformers(character) {
    /**
     * Get all Character Actor transformers, organised by source.
     * @param {object} character: a character Actor object.
     */
    // make sure any temp data is included
    updateTempTransformers(character);
    // get all transformers by unique source
    // TODO: do this without nested for loops
    let transformersBySource = {};
    let sources = [];
    let targetsBySource = {};
    for (let type of transformerTypes) {
        Object.entries(character[type]).forEach(
            ([attr, attrTransformers]) => {
                for (let transformer of attrTransformers) {
                    // make sure entry for source exists, else add it
                    if (!sources.includes(transformer._id)) {
                        sources.push(transformer._id);
                        transformersBySource[transformer._id] = {name: ""}
                        targetsBySource[transformer._id] = [];
                        // handle doc-type source
                        if (transformer.isDocument) {
                            let tempItem = transformer._id;
                            tempItem = character.getEmbeddedDocument("Item", transformer._id);
                            if (tempItem) {
                                transformersBySource[transformer._id].name = tempItem.name;
                            }
                        }
                    }
                    // make sure target for source exists, else add it
                    if (!targetsBySource[transformer._id].includes(attr)) {
                        targetsBySource[transformer._id].push(attr)
                        transformersBySource[transformer._id][attr] = {}
                    }
                    // add modifier for type
                    transformersBySource[transformer._id][attr][type] = transformer.mod;
                }
            }
        );
    }
    // return
    return transformersBySource;
}

export function getTransformation(
    character, type, attr, includeDetail = false, includeGlobals = false
) {
    /**
     * Get a Character Actor transformation.
     *
     * @param {object} character: a character Actor object.
     * @param {string} type: the type of transformer.
     * @param {string} attr: the type of attribute to update ("all" for all available attributes).
     * @param {boolean} includeDetail: whether or not to include details from individual transformers.
     * @param {boolean} includeGlobals: whether or not to also include global transformers in the summation (or, transformers to attr "ALL").
     * @returns {object}: a data object including total and an array of possible docs.
     */

    // make sure any temp data is included
    updateTempTransformers(character);

    // return props
    let total = 0;
    let detail = [];

    // determines sources
    let sources = [];
    // include attr
    if (character[type][attr]) { sources.push(character[type][attr]); }
    // include global transformers (if specified)
    if (includeGlobals && character[type][CHARACTER_ATTR_CONSTANTS.ALL]) {
        sources.push(character[type][CHARACTER_ATTR_CONSTANTS.ALL]);
    }

    // get total transformation for type to attr
    // TODO: find a better way to do this without nested for loops or code duplication
    sources.forEach(
        (source) => {
            source.forEach(
                (transformer) => {
                    total += transformer.mod;

                    // include details (if specified)
                    if (includeDetail) {
                        let tempItem = transformer._id;
                        // handle transformers from documents (embedded objects)
                        if (transformer.isDocument) {
                            tempItem = character.getEmbeddedDocument("Item", transformer._id);
                        }
                        if (tempItem) {
                            detail.push({
                                docName: tempItem.name, mod: transformer.mod, source: transformer._id
                            })
                        }
                    }
                }
            )
        }
    )

    // return
    return {total: total, detail: detail};
}

export function removeAllTransformersFromSource(character, sourceId, save = false) {
    /**
     * Remove all existing Character Actor transformers from a specific source.
     *
     * @param {object} character: a character Actor object.
     * @param {string} sourceId: the id of the source of the transformation.
     * @param {boolean} save: whether or not to save Actor transformers to temp data after operation.
     */

    _warnToUpdateTempTransformers(character);

    // remove any existing transformers for w/ sourceId
    // for each transformer type...
    for (let type of transformerTypes) {
        let transformersForType = character[type];
        // search each character attribute target...
        for (let [attr, transformers] of Object.entries(transformersForType)) {
            // and remove any transformer from specified source
            removeTransformer(character, type, attr, sourceId);
        }
    }

    // save (if specified)
    if (save) saveTransformers(character);
}

export function removeTransformer(character, type, attr, sourceId, save = false) {
    /**
     * Remove an existing Character Actor transformer.
     *
     * @param {object} character: a character Actor object.
     * @param {string} type: the type of transformer.
     * @param {string} attr: the type of attribute to update ("all" for all available attributes).
     * @param {string} sourceId: the id of the source of the transformation.
     * @param {boolean} save: whether or not to save Actor transformers to temp data after operation.
     */

    _warnToUpdateTempTransformers(character);

    // remove any existing transformers for specified transformer and attr w/ sourceId
    if (character[type][attr]) {
        character[type][attr] = character[type][attr].filter(item => item._id !== sourceId)
    }

    // save (if specified)
    if (save) saveTransformers(character);
}

export function saveTransformers(character) {
    /**
     * Save existing Character Actor transformers to temporary transformers of a Character.
     * This is the opposite of updateTempTransformers().
     *
     * @param {object} character: a character Actor object.
     */

    _warnToUpdateTempTransformers(character);

    let data = {}
    for (let type of transformerTypes) {
        data[`system.${type}`] = character[type]
    }
    let context = { diff: false }
    character.update(data, context)
}

export function updateTempTransformers(character) {
    /**
     * Update a Character Actor with all current (temporary) transformers.
     * "Temporary" transformers exist in .system and need to be transposed to the Actor object
     * to be acted upon. I believe this is to handle multiple client updates from various vectors
     * but maintain a single source of truth.
     *
     * @param {object} character: a character Actor object.
     */

    let data = getData(character);
    for (let type of transformerTypes) {
        character[type] = data[type];
    }
}
