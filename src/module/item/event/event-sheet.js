import { ItemSheetChronicle } from "../item-sheet-chronicle.js";

/**
 * A sheet for handling event item types.
 */
export class EventSheet extends ItemSheetChronicle {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "event"],
            width: 650,
            height: 600,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.checkButton').on("click", this._onClickPlayerChoice.bind(this));
    }

    async _onClickPlayerChoice(ev) {
        ev.preventDefault();
        this.item.update({"system.playerChoice": !this.item.getCSData().playerChoice});
    }
}