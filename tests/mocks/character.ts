import {
    transformerTypes
// @ts-ignore
} from "@actor/character/transformers";
import {
    getData
// @ts-ignore
} from "@module/common";

/**
 * A character Actor mock for use in testing.
 */
export class TestCharacter {
    owned = {
        abilities: []
    }
    system = {}

    constructor() {
        // initialize with default attr
        for (let type of transformerTypes) {
            this[type] = {};
            this.system[type] = {};
        }
    }
    getData() { return getData(this); }

    update(data, context) {
        for (let prop in data) {
            let props = prop.split(".")
            this[props[0]][props[1]] = data[prop]
        }
    }

    getEmbeddedDocument(type: string, id: string) {
        let embeddedItem = null;
        for (let [itemType, items] of Object.entries(this.owned)) {
            let tempItem = items.find((item) => item["_id"] === id);
            if (tempItem) {
                embeddedItem = tempItem;
                break;
            }
        }
        return embeddedItem;
    }

    getEmbeddedCollection(type: string) {
        let collection = []
        for (let [itemType, items] of Object.entries(this.owned)) {
            collection = collection.concat(items);
        }
        return collection;
    }
}
