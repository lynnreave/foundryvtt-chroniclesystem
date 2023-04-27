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
    currentDisposition: number = 4;
    owned: object = {
        abilities: []
    };
    system: object = {
        currentDisposition: 4,
        // defaults from template.json actor.templates.common
        movement: {
            "base": 4,
            "runBonus": 0,
            "sprintMultiplier": 4,
            "bulk": 0,
            "modifier": 0,
            "total": 0,
            "sprintTotal": 0
        }
    };

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
            // @ts-ignore
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
