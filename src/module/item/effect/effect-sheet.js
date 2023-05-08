import { ItemSheetChronicle } from "../item-sheet-chronicle.js";
import { transformerTypes } from "../../actor/character/transformers.js";
import { getData } from "../../common.js";

/**
 * The ItemSheet entity for handling effects.
 * @extends {ItemSheetChronicle}
 */
export class EffectSheet extends ItemSheetChronicle {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item", "weapon"],
            width: 650,
            height: 750,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".effect-transformation-create").on(
            "click", this._onClickEffectTransformationCreate.bind(this)
        );
        html.find(".effect-transformations-control").on(
            "click", this._onClickEffectTransformationsControl.bind(this)
        );
    }

    async _onClickEffectTransformationCreate(ev) {
        const effect = this.item;
        let transformation = {
            target: "",
        };
        for (let type of transformerTypes) {
            transformation[type] = 0;
        }
        let transformations = Array.from(Object.values(getData(effect).transformations));
        transformations.push(transformation);
        effect.update({"system.transformations" : transformations});
    }

    async _onClickEffectTransformationsControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const index = parseInt(a.dataset.id);
        const action = a.dataset.action;

        // Remove existing specialty
        if (action === "delete") {
            const effect = this.item;
            let transformations = Array.from(Object.values(getData(effect).transformations));
            transformations.splice(index,1);
            effect.update({"system.transformations" : transformations});
        }
    }
}