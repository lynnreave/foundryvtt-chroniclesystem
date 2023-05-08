import { getData } from "../../common.js";
import {
    addTransformer,
    removeTransformer,
    saveTransformers,
    transformerTypes,
    updateTempTransformers
} from "../../actor/character/transformers.js";

export function onEquippedChanged(effect, actor, isEquipped) {
    /**
     * Tasks to execute when the equipped state of the Effect Item is changed.
     * @param {Effect} effect: the Effect Item.
     * @param {Actor} actor: the Actor that owns the Effect.
     * @param {boolean} isEquipped: whether or not the Effect is being equipped.
     */
    // get effect data
    const data = getData(effect);
    updateTempTransformers(actor);
    // equipping
    if (isEquipped) {
        // cycle through transformers
        Object.values(data.transformations).forEach((transformation) => {
            // get correct target value
            let target;
            if (transformation.target) {
                target = transformation.target.trim().toLowerCase().replaceAll(" ", "_")
            }
            if (target) {
                for (let type of transformerTypes) {
                    if (transformation[type] && transformation[type] !== 0) {
                        // add transformer
                        addTransformer(
                            actor, type, target, effect._id, transformation[type], true
                        );
                    }
                }
            }
        });
    // un-equipping
    } else {
        // cycle through transformers
        Object.values(data.transformations).forEach((transformation) => {
            // get correct target value
            let target;
            if (transformation.target) {
                target = transformation.target.trim().toLowerCase().replaceAll(" ", "_")
            }
            if (target) {
                for (let type of transformerTypes) {
                    removeTransformer(actor, type, target, effect._id);
                }
            }
        });
    }
    saveTransformers(actor);
}
