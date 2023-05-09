import { ItemChronicle } from "../item-chronicle.js";
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import LOGGER from "../../../util/logger.js";
import { getData } from "../../common.js";
import {
    addTransformer,
    removeAllTransformersFromSource
} from "../../actor/character/transformers.js";

export class Weapon extends ItemChronicle {
    onEquippedChanged(actor, isEquipped) {
        LOGGER.trace(`Weapon ${this._id} ${isEquipped? "equipped" : "unequipped" } by the actor ${actor.name} | csWeaponItem.js`);
        super.onEquippedChanged(actor, isEquipped);
        //TODO: implement the onEquippedChanged from Weapon
    }

    onObtained(actor) {
        LOGGER.trace(`Weapon ${this._id} obtained by the actor ${actor.name} | csWeaponItem.js`);
        super.onObtained(actor);
        let weaponData = getData(this);
        // add bulk (if any)
        if (weaponData.bulk > 0) {
            addTransformer(
                actor, "modifiers", ChronicleSystem.modifiersConstants.BULK, this._id, weaponData.bulk
            );
        }
    }

    onDiscardedFromActor(actor, oldId) {
        LOGGER.trace(`Weapon ${oldId} Discarded from actor | csWeaponItem.js`);
        super.onDiscardedFromActor(actor, oldId);
        // remove any transformers
        removeAllTransformersFromSource(actor, oldId);
    }
}