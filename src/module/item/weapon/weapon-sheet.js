import { ItemSheetChronicle } from "../item-sheet-chronicle.js";

/**
 * The ItemSheet entity for handling weapons.
 * @extends {ItemSheetChronicle}
 */
export class WeaponSheet extends ItemSheetChronicle {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "weapon"],
            width: 800,
            height: 800,
        });
    }
}
