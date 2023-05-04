import { ItemChronicle } from "../item-chronicle.js";
import { onEquippedChanged } from "./helpers.js";
import { getData } from "../../common.js";

/**
 * The Item entity for handling generic effects.
 * This is a catch-all for transformers that are not calculated from elsewhere.
 *
 * @category Item
 */

export class Effect extends ItemChronicle {
    onEquippedChanged(actor, isEquipped) {
        super.onEquippedChanged(actor, isEquipped);
        onEquippedChanged(this, actor, isEquipped);
    }

    onObtained(actor) {
        super.onObtained(actor);
        let isEquipped = getData(this).isActive;
        onEquippedChanged(this, actor, isEquipped);
    }

    onDiscardedFromActor(actor, oldId) {
        super.onDiscardedFromActor(actor, oldId);
        onEquippedChanged(this, actor, false);
    }
}
