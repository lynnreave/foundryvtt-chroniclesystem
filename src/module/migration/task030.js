import {ChronicleSystem} from "../system/ChronicleSystem.js";

export async function task030() {
    const actors = Array.from(game.actors?.values() || []);
    for (const actor of actors) {
        for (const ownedItem of Array.from(actor.items.values())) {
            if (ownedItem.type === "armor") {
                let data = ownedItem.getCSData();
                if (data.equipped === 1) {
                    actor.updateTempTransformers();
                    actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.COMBAT_DEFENSE,
                        ownedItem._id,
                        data.penalty,
                        true);
                    actor.removeTransformer("modifiers", "damage_taken", ownedItem._id);
                    actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.DAMAGE_TAKEN, ownedItem._id, ownedItem.getCSData().rating);
                    actor.saveTransformers();
                }
            }
        }
    }
}
