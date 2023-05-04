import { getData } from "../common.js"

/**
 * Extend the Item entity with generic, top-level attributes for the Chronicle System.
 * This is the base Item entity for the system, from which all other Item entities derive.
 * Include elements here that will affect all Item types.
 *
 * @category Item
 */
export class ItemChronicle extends Item {

    getCSData() { return getData(this); }

    prepareData() {
        super.prepareData();
    }

    onEquippedChanged(actor, isEquipped) { }

    onObtained(actor) { }

    onDiscardedFromActor(actor, oldId) { }

    _onArmorEquippedChanged(actor, isEquipped) { }
}
