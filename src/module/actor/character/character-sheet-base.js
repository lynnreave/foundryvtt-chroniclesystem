import { ActorSheetChronicle } from "../actor-sheet-chronicle.js";
import {
  removeAllTransformersFromSource,
  removeTransformer,
  saveTransformers,
  transformerTypes,
  updateTempTransformers
} from "./transformers.js";
import { getData } from "../../common.js";
import { onEquippedChanged } from "../../item/effect/helpers.js";

/**
 * The base ActorSheet entity for Character ActorSheet types.
 *
 * @category ActorSheet
 */
export class CharacterSheetBase extends ActorSheetChronicle {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 900,
      height: 900,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheet-body",
          initial: "abilities"
        }
      ],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  async _onClickOwnedItemControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const itemIndex = parseInt(a.dataset.index);
    const list = a.dataset.list;
    const action = a.dataset.action;
    const itemId = this.actor.system.owned[list][itemIndex]._id

    if ( action === "delete" ) {
      this.actor.deleteEmbeddedDocuments("Item", [itemId,])
    }
  }

  async _onClickSquare(ev) {
    ev.preventDefault();
    let method = `set${ev.currentTarget.dataset.type}Value`;
    await this[method](ev.currentTarget.id);
  }

  async _onClickEffectClearAll(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const sourceId = a.dataset.source;
    updateTempTransformers(this.actor);
    // remove all transformers from source
    for (let type of transformerTypes) {
      removeAllTransformersFromSource(this.actor, sourceId);
    }
    // save to data
    saveTransformers(this.actor);
  }

  async _onClickEffectClear(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const sourceId = a.dataset.source;
    const attr = a.dataset.target;
    updateTempTransformers(this.actor);
    // remove transformers from source to target of all types
    for (let type of transformerTypes) {
      removeTransformer(this.actor, type, attr, sourceId);
    }
    // save to data
    saveTransformers(this.actor);
  }

  async _onItemToggleActive(event) {
    event.preventDefault();
    const eventData = event.currentTarget.dataset;
    const itemId = eventData.itemId;
    // get the owned item document
    let document = this.actor.getEmbeddedDocument('Item', itemId);
    // get item data
    let docData = getData(document);
    let targetState = !docData.isActive
    // toggle by type
    if (document.type === "effect") {
      await document.update({"system.isActive": targetState});
      await onEquippedChanged(document, this.actor, targetState);
    }
  }

  /* -------------------------------------------- */

  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    }
    catch (err) {
      return;
    }
    return super._onDrop(event);
  }

  isItemPermitted(type) {
    return this.itemTypesPermitted.includes(type);
  }
}
