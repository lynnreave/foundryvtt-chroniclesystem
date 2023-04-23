import {CSItem} from "./csItem.js";
import {ChronicleSystem} from "../system/ChronicleSystem.js";
import LOGGER from "../../util/logger.js";

export class CSArmorItem extends CSItem {
    onEquippedChanged(actor, isEquipped) {
        const data = this.getCSData();
        LOGGER.trace(`Armor ${data._id} ${isEquipped? "equipped" : "unequipped" } by the actor ${actor.name} | csArmorItem.js`);
        super.onEquippedChanged(actor, isEquipped);
        if (isEquipped) {
            actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.AGILITY, this._id, this.getCSData().penalty);
            actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.COMBAT_DEFENSE, this._id, this.getCSData().penalty);
            actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.DAMAGE_TAKEN, this._id, this.getCSData().rating);
        } else {
            actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.AGILITY, this._id);
            actor.removeTransformer(
                "modifiers", ChronicleSystem.modifiersConstants.DAMAGE_TAKEN, this._id
            );
            actor.removeTransformer(
                "modifiers", ChronicleSystem.modifiersConstants.COMBAT_DEFENSE, this._id
            );
        }
    }

    onObtained(actor) {
        LOGGER.trace(`Armor ${this._id} obtained by the actor ${actor.name} | csArmorItem.js`);
        super.onObtained(actor);
        if (this.getCSData().bulk > 0) {
            actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.BULK, this._id, this.getCSData().bulk);
        }
    }

    onDiscardedFromActor(actor, oldId) {
        LOGGER.trace(`Armor ${oldId} Discarded from actor | csArmorItem.js`);
        super.onDiscardedFromActor(actor, oldId);
        if (this.getCSData().bulk > 0) {
            actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.BULK, oldId);
            actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.AGILITY, oldId);
            actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.DAMAGE_TAKEN, oldId);
        }
    }
}
