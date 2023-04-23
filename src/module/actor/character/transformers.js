/**
 * Notes on Character "transformers":
 *
 * "transformer": any change to the base test dice, bonus dice, or value of an attribute or roll.
 * "transformation": the sum of all changes from a single type of transformer.
 * "poolMods": changes to the test dice of a roll; dice pool modifier; test dice modifier.
 * [DEPRECATING] "penalties": negative changes to the test dice of a roll.
 * "bonuses": changes to the bonus dice of a roll.
 * "modifiers": flat changes to the outcome of a roll or some attribute value.
 *
 */
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

export function updateTempTransformers(character) {
    /**
     * Update a Character Actor with all current (temporary) transformers.
     * "Temporary" transformers exist in .system and need to be transposed to the Actor object
     * to be acted upon. I believe this is to handle multiple client updates from various vectors
     * but maintain a single source of truth.
     *
     * @param {object} character: a character Actor object.
     */

    let data = character.getData();
    for (let type of transformerTypes) {
        character[type] = data[type];
    }
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
        let index = character[type][attr].indexOf((trans) => trans._id === sourceId);
        character[type][attr].splice(index, 1);
    }

    // save (if specified)
    if (save) saveTransformers(character);
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

export function getTransformation(
    character, type, attr, includeDetail = false, includeModifierGlobal = false
) {
    /**
     * Get a Character Actor transformation.
     *
     * @param {object} character: a character Actor object.
     * @param {string} type: the type of transformer.
     * @param {string} attr: the type of attribute to update ("all" for all available attributes).
     * @param {boolean} includeDetail: whether or not to include details from individual transformers.
     * @param {boolean} includeModifierGlobal: whether or not to also include global transformers in the summation (or, transformers to attr "ALL").
     */

    // make sure any temp data is included
    updateTempTransformers(character);

    // return props
    let total = 0;
    let detail = [];

    // get total transformation for type to attr
    if (character[type][attr]) {
        character[type][attr].forEach((transformer) => {
            total += transformer.mod;

            // include details (if specified)
            if (includeDetail) {
                let tempItem = transformer._id;
                // handle transformers from documents (embedded objects)
                if (transformer.isDocument) {
                    tempItem = character.getEmbeddedDocument("Item", transformer._id);
                }
                if (tempItem) {
                    detail.push({ docName: tempItem.name, mod: transformer.mod })
                }
            }
        });
    }

    // return
    return {total: total, detail: detail};
}
