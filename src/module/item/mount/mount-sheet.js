import { ItemSheetChronicle } from "../item-sheet-chronicle.js";

/**
 * A sheet for handling action combat item types.
 */
export class MountSheet extends ItemSheetChronicle {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "mount"],
            width: 650,
            height: 600,
        });
    }
}
