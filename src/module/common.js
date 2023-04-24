export function getData(document) {
    /**
     * Return the data for a document (e.g., Actor, Item, etc.).
     * In most cases, this corresponds to the template data definition for the document type.
     *
     * @param {object} document: the document.
     * @returns {object}: a data object.
     */

    return document.system;
}
