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
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import { updateWeaponDefendingState } from "./character/helpers.js";
import { getWeaponTestDataForActor } from "./helpers.js";

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
      height: 1000,
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

  getData(options) {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    this.splitItemsByType(data);

    let character = getData(data.actor);
    this.isOwner = this.actor.isOwner;

    character.owned.equipments = this._checkNull(data.itemsByType['equipment']);
    character.owned.weapons = this._checkNull(data.itemsByType['weapon']);
    character.owned.armors = this._checkNull(data.itemsByType['armor']);
    character.owned.abilities = this._checkNull(data.itemsByType['ability']).sort((a, b) => a.name.localeCompare(b.name));
    character.owned.effects = this._checkNull(data.itemsByType['effect']).sort((a, b) => a.name.localeCompare(b.name));

    data.notEquipped = ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED;

    character.owned.weapons.forEach((weapon) => {
      getWeaponTestDataForActor(data.actor, weapon);
    });

    data.character = character;
    return data;
  }

  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.item .item-name').on('click', (ev) => {
      $(ev.currentTarget).parents('.item').find('.description').slideToggle();
    });
    html.find('.item .toggle-active').click(this._onItemToggleActive.bind(this));
    html.find('.equipped').click(this._onEquippedStateChanged.bind(this));
    html.find(".square").on("click", this._onClickSquare.bind(this));
    html.find(".owned-item-control").on("click", this._onClickOwnedItemControl.bind(this));
    html.find(".effect-clear").on("click", this._onClickEffectClear.bind(this));
    html.find(".effect-clear-all").on("click", this._onClickEffectClearAll.bind(this));
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
      await this.actor.deleteEmbeddedDocuments("Item", [itemId,])
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

  async _onEquippedStateChanged(event) {
    event.preventDefault();
    const eventData = event.currentTarget.dataset;
    let document = this.actor.getEmbeddedDocument('Item', eventData.itemId);
    let collection = [];
    let tempCollection = [];

    let isArmor = parseInt(eventData.hand) === ChronicleSystem.equippedConstants.WEARING;
    let isCommander = parseInt(eventData.hand) === ChronicleSystem.equippedConstants.COMMANDER;
    let isUnequipping = parseInt(eventData.hand) === 0;

    if (isUnequipping) {
      document.getCSData().equipped = 0;
      let documentData = document.getCSData()
      if (documentData.isDefending) {
        // this results in a second click being required
        // TODO: fix this if possible
        await updateWeaponDefendingState(this.actor, eventData.itemId, false);
        await document.update({"system.isDefending": false})
      }
    } else {
      if (isCommander) {
        getData(document).equipped = ChronicleSystem.equippedConstants.COMMANDER;
        let items = this.actor.getEmbeddedCollection('Item')
        tempCollection = items.filter((item) => getData(item).equipped === ChronicleSystem.equippedConstants.COMMANDER);
        getData(this.actor).commander = tempCollection[0];
      }
      else if (isArmor) {
        getData(document).equipped = ChronicleSystem.equippedConstants.WEARING;
        tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === ChronicleSystem.equippedConstants.WEARING);
      } else {
        if (getData(document).isTwoHanded) {
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === ChronicleSystem.equippedConstants.MAIN_HAND || getData(item).equipped === ChronicleSystem.equippedConstants.OFFHAND || getData(item).equipped === ChronicleSystem.equippedConstants.BOTH_HANDS);
          getData(document).equipped = ChronicleSystem.equippedConstants.BOTH_HANDS;
        } else {
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === parseInt(eventData.hand) || getData(item).equipped === ChronicleSystem.equippedConstants.BOTH_HANDS);
          getData(document).equipped = parseInt(eventData.hand);
        }
      }
    }

    updateTempTransformers(this.actor);

    tempCollection.forEach((item) => {
      collection.push({_id: item._id, "system.equipped": ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED});
      item.onEquippedChanged(this.actor, false);
    });

    collection.push({_id: document._id, "system.equipped": getData(document).equipped});
    document.onEquippedChanged(this.actor, getData(document).equipped > 0);

    saveTransformers(this.actor);

    this.actor.updateEmbeddedDocuments('Item', collection);
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
