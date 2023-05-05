import {ItemChronicle} from "../item-chronicle.js";
import {ChronicleSystem} from "../../system/ChronicleSystem.js";
import LOGGER from "../../../util/logger.js";

export class Weapon extends ItemChronicle {
    onEquippedChanged(actor, isEquipped) {
        LOGGER.trace(`Weapon ${this._id} ${isEquipped? "equipped" : "unequipped" } by the actor ${actor.name} | csWeaponItem.js`);
        super.onEquippedChanged(actor, isEquipped);
        //TODO: implement the onEquippedChanged from Weapon
    }

    onObtained(actor) {
        LOGGER.trace(`Weapon ${this._id} obtained by the actor ${actor.name} | csWeaponItem.js`);
        super.onObtained(actor);
        let qualities = this.getCSData().qualities;
        Object.values(qualities).forEach(quality => {
            switch (quality.name.toLowerCase())
            {
                case ChronicleSystem.modifiersConstants.BULK:
                    actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.BULK, this._id, parseInt(quality.parameter));
                    break;
            }
        });
    }

    onDiscardedFromActor(actor, oldId) {
        LOGGER.trace(`Weapon ${oldId} Discarded from actor | csWeaponItem.js`);
        super.onDiscardedFromActor(actor, oldId);
        let qualities = this.getCSData().qualities;
        Object.values(qualities).forEach(quality => {
            switch (quality.name.toLowerCase())
            {
                case ChronicleSystem.modifiersConstants.BULK:
                    actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.BULK, oldId);
                    break;
            }
        });
    }
}