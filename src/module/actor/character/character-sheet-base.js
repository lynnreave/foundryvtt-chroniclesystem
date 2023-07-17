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
import { EQUIPPED_CONSTANTS } from "../../constants.js";
import { getAbilityTestFormula } from "../../roll/rolls.js";

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

    data.notEquipped = EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED;

    // build ability and specialty test data formulas
    character.owned.abilities.forEach((ability) => {
      ability.formula = getAbilityTestFormula(data.actor, ability.name, null)
      // specialty formulas
      let abilityData = getData(ability);
      let specialties = [];
      Object.entries(abilityData.specialties).forEach((specialty, index) => {
        specialty.formula = getAbilityTestFormula(
            data.actor, ability.name, specialty[1].name
        );
        specialties.push(specialty);
      });
      abilityData.specialties = specialties;
    });

    // build weapon test data formulas
    character.owned.weapons.forEach((weapon) => {
      getWeaponTestDataForActor(data.actor, weapon);
    });

    data.character = character;
    return data;
  }

  async handleRollAsync(rollType, actor, showModifierDialog = false) {
    await ChronicleSystem.handleRollAsync(rollType, actor, showModifierDialog)
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
    html.find(".effect-clear").on("click", this._onClickEffectClear.bind(this));
    html.find(".effect-clear-all").on("click", this._onClickEffectClearAll.bind(this));
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

    let isArmor = parseInt(eventData.hand) === EQUIPPED_CONSTANTS.WEARING;
    let isCommander = parseInt(eventData.hand) === EQUIPPED_CONSTANTS.COMMANDER;
    let isMount = parseInt(eventData.hand) === EQUIPPED_CONSTANTS.MOUNTED;
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
      // build list of items to unequip due to the currently equipping item (by type of equip status)
      if (isCommander) {
        getData(document).equipped = EQUIPPED_CONSTANTS.COMMANDER;
        let items = this.actor.getEmbeddedCollection('Item')
        tempCollection = items.filter((item) => getData(item).equipped === EQUIPPED_CONSTANTS.COMMANDER);
        getData(this.actor).commander = tempCollection[0];
      } else if (isArmor) {
        getData(document).equipped = EQUIPPED_CONSTANTS.WEARING;
        tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === EQUIPPED_CONSTANTS.WEARING);
      } else if (isMount) {
          getData(document).equipped = EQUIPPED_CONSTANTS.MOUNTED;
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === EQUIPPED_CONSTANTS.MOUNTED);
      } else {
        // if equipping with both hands, unequip all one-handed and two-handed items
        if (parseInt(eventData.hand) === EQUIPPED_CONSTANTS.BOTH_HANDS) {
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === EQUIPPED_CONSTANTS.MAIN_HAND || getData(item).equipped === EQUIPPED_CONSTANTS.OFFHAND || getData(item).equipped === EQUIPPED_CONSTANTS.BOTH_HANDS);
          getData(document).equipped = EQUIPPED_CONSTANTS.BOTH_HANDS;
        // else, unequip all same-handed or two handed items
        } else {
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => getData(item).equipped === parseInt(eventData.hand) || getData(item).equipped === EQUIPPED_CONSTANTS.BOTH_HANDS);
          getData(document).equipped = parseInt(eventData.hand);
        }
      }
    }

    updateTempTransformers(this.actor);

    // update list of items to unequip with unequipped status and push to update list
    tempCollection.forEach((item) => {
      collection.push({_id: item._id, "system.equipped": EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED});
      // run equipment changed method for each equipment (remove transformers)
      item.onEquippedChanged(this.actor, false);
    });

    // add the main item changing to update list
    collection.push({_id: document._id, "system.equipped": getData(document).equipped});
    // run on change equipped state (add transformers)
    document.onEquippedChanged(this.actor, getData(document).equipped > 0);

    // save transformer updates for actor
    saveTransformers(this.actor);

    // push update
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
