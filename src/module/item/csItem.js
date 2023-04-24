import { getData } from "../common.js"

export class CSItem extends Item {

    getCSData() { return getData(this); }

    prepareData() {
        super.prepareData();
    }

    onEquippedChanged(actor, isEquipped) { }

    onObtained(actor) { }

    onDiscardedFromActor(actor, oldId) { }

    _onArmorEquippedChanged(actor, isEquipped) {

    }
}
