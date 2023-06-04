import { ItemSheetChronicle } from "../item-sheet-chronicle.js";
import { RESOURCE_TYPES } from "../../selections.js";

/**
 * A sheet for handling building holding item types.
 */
export class BuildingSheet extends ItemSheetChronicle {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "building"],
            width: 650,
            height: 800,
        });
    }

    getData(options) {
        let data = super.getData(options);

        // select options
        data.resourceTypes = RESOURCE_TYPES;

        // return
        return data;
    }

}
