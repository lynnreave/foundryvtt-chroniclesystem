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
    currentDisposition: number = 0;
    currentFacing: number = 0;
    currentFormation: number = 0;
    currentStatus: number = 0;
    owned: object = {
        abilities: []
    };
    system: object = {
        derivedStats: {
            combatDefense: {
                "value": 0,
                "modifier": 0,
                "override": false,
                "overrideValue": 0
            },
            intrigueDefense: {
                "value": 0,
                "modifier": 0,
                "override": false,
                "overrideValue": 0
            }
        },
        currentDisposition: 0,
        currentFacing: 0,
        currentFormation: 0,
        currentStatus: 0,
        // defaults from template.json actor.templates.common
        movement: {
            "base": 4,
            "runBonus": 0,
            "sprintMultiplier": 4,
            "bulk": 0,
            "modifier": 0,
            "total": 0,
            "sprintTotal": 0
        },
        // defaults from template.json actor.unit
        discipline: {
            "value": 0,
            "modifier": 0,
            "ordersReceivedModifier": 0,
            "total": 0
        },
        disorganisation: {
            "value": 0,
            "modifier": 0,
            "current": 0,
            "total": 1
        },
        ordersReceived: {
            "value": 0,
            "modifier": 0,
            "current": 0,
            "total": 1
        },
        techniques: {},
        owned: {
            abilities: []
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
            if (props.length == 2) {
                this[props[0]][props[1]] = data[prop]
            } else if (props.length == 3) {
                this[props[0]][props[1]][props[2]] = data[prop]
            }
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

    updateEmbeddedDocuments(type: string, docs: []) {}
}
