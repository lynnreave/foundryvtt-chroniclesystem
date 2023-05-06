import { CSItemSheet } from "../sheets/csItemSheet.js";

/**
 * The ItemSheet entity for handling weapons.
 * @extends {CSItemSheet}
 */
export class WeaponSheet extends CSItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "weapon"],
            width: 800,
            height: 800,
        });
    }
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-flag-toggle").on("click", this._onClickItemFlagToggle.bind(this));
    }

    async _onClickItemFlagToggle(event) {
        let itemFlag = event.currentTarget.name;
        let currentState = event.currentTarget.value === "true";
        let targetState = !currentState;
        let pkg = {};
        pkg[`system.${itemFlag}`] = targetState;
        await this.item.update(pkg);
    }
}
