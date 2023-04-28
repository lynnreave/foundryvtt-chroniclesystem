import { ActorSheetChronicle } from "../actor-sheet-chronicle.js";
import {
  removeAllTransformersFromSource,
  removeTransformer,
  saveTransformers,
  transformerTypes
} from "./transformers.js";

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

  async _onClickSquare(ev) {
    ev.preventDefault();
    let method = `set${ev.currentTarget.dataset.type}Value`;
    await this[method](ev.currentTarget.id);
  }

  async _onClickEffectClearAll(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const sourceId = a.dataset.source;
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
    // remove transformers from source to target of all types
    for (let type of transformerTypes) {
      removeTransformer(this.actor, type, attr, sourceId);
    }
    // save to data
    saveTransformers(this.actor);
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
