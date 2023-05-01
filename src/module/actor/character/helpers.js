import { getData } from "../../common.js";

export function refreshEmbeddedActorData(actorItem) {
    /**
     * Refresh the embedded Actor item with their linked Actor.
     */
    // get the target actor
    let actorItemData = getData(actorItem);
    let targetActor = game.actors.get(actorItemData.targetId);
    // update actor item
    if (targetActor) {
        actorItem.name = targetActor.name;
        actorItem.img = targetActor.img;
    }
}