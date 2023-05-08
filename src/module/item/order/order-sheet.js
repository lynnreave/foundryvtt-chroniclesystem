import { ItemSheetChronicle } from "../item-sheet-chronicle.js";

/**
 * A sheet for handling order item types.
 */
export class OrderSheet extends ItemSheetChronicle {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "order"],
            width: 650,
            height: 800,
        });
    }
}
