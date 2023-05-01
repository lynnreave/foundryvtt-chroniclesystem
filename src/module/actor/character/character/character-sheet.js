import LOGGER from "../../../../util/logger.js";
import SystemUtils from "../../../../util/systemUtils.js";
import { CharacterSheetBase } from "../character-sheet-base.js";
import { ChronicleSystem } from "../../../system/ChronicleSystem.js";
import { CSConstants } from "../../../system/csConstants.js";
import { Technique } from "../../../type/technique.js";
import {
  updateDisposition,
  updateWeaponDefendingState
} from "./helpers.js";
import { CHARACTER_DISPOSITIONS } from "../../../selections.js";
import { refreshEmbeddedActorData } from "../helpers.js";

/**
 * The ActorSheet entity for handling characters.
 * This currently includes both player and non-player characters.
 *
 * @category ActorSheet
 */
export class CharacterSheet extends CharacterSheetBase {
  itemTypesPermitted = [
      "ability",
      "weapon",
      "armor",
      "equipment",
      "benefit",
      "drawback",
      "technique",
      "relationship"
  ]

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["chroniclesystem", "character", "sheet", "actor"],
      template: "systems/chroniclesystem/templates/actors/characters/character-sheet.hbs"
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    this.splitItemsByType(data);

    let character = data.actor.getData();
    this.isOwner = this.actor.isOwner;

    character.owned.equipments = this._checkNull(data.itemsByType['equipment']);
    character.owned.weapons = this._checkNull(data.itemsByType['weapon']);
    character.owned.armors = this._checkNull(data.itemsByType['armor']);
    character.owned.benefits = this._checkNull(data.itemsByType['benefit']);
    character.owned.drawbacks = this._checkNull(data.itemsByType['drawback']);
    character.owned.abilities = this._checkNull(data.itemsByType['ability']).sort((a, b) => a.name.localeCompare(b.name));
    character.owned.techniques = this._checkNull(data.itemsByType['technique']).sort((a, b) => a.name.localeCompare(b.name));
    character.owned.relationships = this._checkNull(data.itemsByType['relationship']).sort((a, b) => a.name.localeCompare(b.name));

    data.dispositions = CHARACTER_DISPOSITIONS;

    data.notEquipped = ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED;

    data.techniquesTypes = CSConstants.TechniqueType;
    data.techniquesCosts = CSConstants.TechniqueCost;

    character.owned.weapons.forEach((weapon) => {
      let weaponData = weapon.system;
      let info = weaponData.specialty.split(':');
      if (info.length < 2)
        return "";
      let formula = ChronicleSystem.getActorAbilityFormula(data.actor, info[0], info[1]);
      formula = ChronicleSystem.adjustFormulaByWeapon(data.actor, formula, weapon);
      let matches = weaponData.damage.match('@([a-zA-Z]*)([-\+\/\*]*)([0-9]*)');
      if (matches) {
        if (matches.length === 4) {
          let ability = data.actor.getAbilityValue(matches[1]);
          weapon.damageValue = eval(`${ability}${matches[2]}${matches[3]}`);
        }
      }
      weapon.formula = formula;
    });

    character.owned.techniques.forEach((technique) => {
      let techniqueData = technique.system;
      let works = data.currentInjuries = Object.values(techniqueData.works);
      works.forEach((work) => {
        if (work.type === "SPELL") {
          work.test.spellcastingFormula = ChronicleSystem.getActorAbilityFormula(data.actor, work.test.spellcasting, null);
        } else {
          work.test.alignmentFormula = ChronicleSystem.getActorAbilityFormula(data.actor, work.test.alignment, null);
          work.test.invocationFormula = ChronicleSystem.getActorAbilityFormula(data.actor, work.test.invocation, null);
          work.test.unleashingFormula = ChronicleSystem.getActorAbilityFormula(data.actor, work.test.unleashing, null);
        }
      });
    });
    // refresh embedded relationships
    character.owned.relationships.forEach((relationship) => {
      refreshEmbeddedActorData(relationship);
    })

    this._calculateIntrigueTechniques(data);

    data.currentInjuries = Object.values(character.injuries).length;
    data.currentWounds = Object.values(character.wounds).length;
    data.maxInjuries = this.actor.getMaxInjuries();
    data.maxWounds = this.actor.getMaxWounds();
    data.character = character;
    return data;
  }

  _calculateIntrigueTechniques(data) {
    let cunningValue = data.actor.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.CUNNING));
    let willValue = data.actor.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.WILL));
    let persuasionValue = data.actor.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION));
    let awarenessValue = data.actor.getAbilityValue(SystemUtils.localize(ChronicleSystem.keyConstants.AWARENESS));

    let bluffFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.DECEPTION), SystemUtils.localize(ChronicleSystem.keyConstants.BLUFF));
    let actFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.DECEPTION), SystemUtils.localize(ChronicleSystem.keyConstants.ACT));
    let bargainFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.BARGAIN));
    let charmFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.CHARM));
    let convinceFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.CONVINCE));
    let inciteFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.INCITE));
    let intimidateFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.INTIMIDATE));
    let seduceFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.SEDUCE));
    let tauntFormula = ChronicleSystem.getActorAbilityFormula(data.actor, SystemUtils.localize(ChronicleSystem.keyConstants.PERSUASION), SystemUtils.localize(ChronicleSystem.keyConstants.TAUNT));

    let intimidateDeceptionFormula = actFormula.bonusDice + actFormula.modifier > bluffFormula.bonusDice + bluffFormula.modifier ? actFormula : bluffFormula;

    data.techniques = {
      bargain: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.BARGAIN), cunningValue, bargainFormula, bluffFormula),
      charm: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.CHARM), persuasionValue, charmFormula, actFormula),
      convince: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.CONVINCE), willValue, convinceFormula, actFormula),
      incite: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.INCITE), cunningValue, inciteFormula, bluffFormula),
      intimidate: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.INTIMIDATE), willValue, intimidateFormula, intimidateDeceptionFormula),
      seduce: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.SEDUCE), persuasionValue, seduceFormula, bluffFormula),
      taunt: new Technique(SystemUtils.localize(ChronicleSystem.keyConstants.TAUNT), awarenessValue, tauntFormula, bluffFormula)
    };
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.item .item-name').on('click', (ev) => {
      $(ev.currentTarget).parents('.item').find('.description').slideToggle();
    });

    html.find('.disposition.option').click(this._onDispositionChanged.bind(this));

    html.find('.equipped').click(this._onEquippedStateChanged.bind(this));
    html.find('.defending').click(this._onDefendingStateChanged.bind(this));

    html.find('.injury-create').on("click", this._onClickInjuryCreate.bind(this));
    html.find(".injuries-list").on("click", ".injury-control", this._onclickInjuryControl.bind(this));

    html.find('.wound-create').on("click", this._onClickWoundCreate.bind(this));
    html.find(".wounds-list").on("click", ".wound-control", this._onclickWoundControl.bind(this));

    html.find(".square").on("click", this._onClickSquare.bind(this));

    html.find(".effect-clear").on("click", this._onClickEffectClear.bind(this));
    html.find(".effect-clear-all").on("click", this._onClickEffectClearAll.bind(this));
  }

  async setFrustrationValue(newValue) {
    let value = Math.max(Math.min(parseInt(newValue), this.actor.getData().derivedStats.frustration.total), 0);

    this.actor.updateTempTransformers();

    if (value > 0) {
      this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.DECEPTION, ChronicleSystem.keyConstants.FRUSTRATION, value, false);
      this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.PERSUASION, ChronicleSystem.keyConstants.FRUSTRATION, value, false);
    } else {
      this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.DECEPTION, ChronicleSystem.keyConstants.FRUSTRATION);
      this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.PERSUASION, ChronicleSystem.keyConstants.FRUSTRATION);
    }

    this.actor.update({
      "data.derivedStats.frustration.current" : value,
      "data.penalties": this.actor.penalties
    });
  }

  async setFatigueValue(newValue) {
    let value = Math.max(Math.min(parseInt(newValue), this.actor.getData().derivedStats.fatigue.total), 0);

    this.actor.updateTempTransformers();

    if (value > 0) {
      this.actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.FATIGUE, -value, false);
    } else {
      this.actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.FATIGUE);
    }

    this.actor.update({
      "data.derivedStats.fatigue.current" : value,
      "data.modifiers": this.actor.modifiers
    });
  }

  async setStressValue(newValue) {
    let value = Math.max(Math.min(parseInt(newValue), this.actor.getData().derivedStats.frustration.total), 0);

    this.actor.updateTempTransformers();

    if (value > 0) {
      this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.AWARENESS, ChronicleSystem.keyConstants.STRESS, value, false);
      this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.CUNNING, ChronicleSystem.keyConstants.STRESS, value, false);
      this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.STATUS, ChronicleSystem.keyConstants.STRESS, value, false);
    } else {
      this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.AWARENESS, ChronicleSystem.keyConstants.STRESS);
      this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.CUNNING, ChronicleSystem.keyConstants.STRESS);
      this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.STATUS, ChronicleSystem.keyConstants.STRESS);
    }

    this.actor.update({
      "data.currentStress" : value,
      "data.penalties": this.actor.penalties
    });
  }

  async _onClickWoundCreate(ev) {
    ev.preventDefault();
    const data = this.actor.getData();
    let wound = "";
    let wounds = Object.values(data.wounds);
    if (wounds.length >= this.actor.getMaxWounds())
      return;
    wounds.push(wound);
    this.actor.updateTempTransformers();
    this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.WOUNDS, wounds.length, false);
    this.actor.update({
      "data.wounds" : wounds,
      "data.penalties" : this.actor.penalties
    });
  }

  async _onclickWoundControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const index = parseInt(a.dataset.id);
    const action = a.dataset.action;

    if ( action === "delete" ) {
      const data = this.actor.getData();
      let wounds = Object.values(data.wounds);
      wounds.splice(index,1);

      this.actor.updateTempTransformers();
      if (wounds.length === 0) {
        this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.WOUNDS);
      } else {
        this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.WOUNDS, wounds.length, false);
      }
      this.actor.update({
        "data.wounds" : wounds,
        "data.penalties" : this.actor.penalties
      });
    }
  }

  async _onClickInjuryCreate(ev) {
    ev.preventDefault();
    const data = this.actor.getData();
    let injury = "";
    let injuries = Object.values(data.injuries);
    if (injuries.length >= this.actor.getMaxInjuries())
      return;

    injuries.push(injury);

    this.actor.updateTempTransformers();
    this.actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.INJURY, -injuries.length, false);

    this.actor.update({
      "data.injuries" : injuries,
      "data.modifiers" : this.actor.modifiers
    });
  }

  async _onclickInjuryControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const index = parseInt(a.dataset.id);
    const action = a.dataset.action;

    if ( action === "delete" ) {
      const data = this.actor.getData();
      let injuries = Object.values(data.injuries);
      injuries.splice(index,1);

      this.actor.updateTempTransformers();
      if (injuries.length === 0) {
        this.actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.INJURY);
      } else {
        this.actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.INJURY, -injuries.length, false);
      }

      this.actor.update({
        "data.injuries" : injuries,
        "data.modifiers" : this.actor.modifiers
      });
    }
  }

  async _onDefendingStateChanged(event) {
    // TODO: get this to not call getData() three times afterwards
    event.preventDefault();
    let eventData = event.currentTarget.dataset;
    let weapon = await updateWeaponDefendingState(this.actor, eventData.itemId, eventData.toState);
    await this.actor.updateEmbeddedDocuments('Item', [weapon]);
  }

  async _onEquippedStateChanged(event) {
    event.preventDefault();
    const eventData = event.currentTarget.dataset;
    let document = this.actor.getEmbeddedDocument('Item', eventData.itemId);
    let collection = [];
    let tempCollection = [];

    let isArmor = parseInt(eventData.hand) === ChronicleSystem.equippedConstants.WEARING;
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
      if (isArmor) {
        document.getCSData().equipped = ChronicleSystem.equippedConstants.WEARING;
        tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === ChronicleSystem.equippedConstants.WEARING);
      } else {
        let twoHandedQuality = Object.values(document.getCSData().qualities).filter((quality) => quality.name.toLowerCase() === "two-handed");
        if (twoHandedQuality.length > 0) {
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === ChronicleSystem.equippedConstants.MAIN_HAND || item.getCSData().equipped === ChronicleSystem.equippedConstants.OFFHAND || item.getCSData().equipped === ChronicleSystem.equippedConstants.BOTH_HANDS);
          document.getCSData().equipped = ChronicleSystem.equippedConstants.BOTH_HANDS;
        } else {
          tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === parseInt(eventData.hand) || item.getCSData().equipped === ChronicleSystem.equippedConstants.BOTH_HANDS);
          document.getCSData().equipped = parseInt(eventData.hand);
        }
      }
    }

    this.actor.updateTempTransformers();

    tempCollection.forEach((item) => {
      collection.push({_id: item._id, "system.equipped": ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED});
      item.onEquippedChanged(this.actor, false);
    });

    collection.push({_id: document._id, "system.equipped": document.getCSData().equipped});
    document.onEquippedChanged(this.actor, document.getCSData().equipped > 0);

    this.actor.saveTransformers();

    this.actor.updateEmbeddedDocuments('Item', collection);
  }

  async _onDispositionChanged(event, targets) {
    event.preventDefault();
    updateDisposition(this.actor, event.target.dataset.id);
  }

  /* -------------------------------------------- */

  async _onDropActor(event, data) {
    LOGGER.trace("On Drop Actor | CSActorSheet | csActorSheet.js");

    // drop actor to create new relationship (if it does not already exist)
    let embeddedItem = [];
    let sourceId = this.actor._id;
    let sourceActor = this.actor;
    let targetId = data.uuid.replace('Actor.', '');
    let targetActor = game.actors.get(targetId);
    let isRelationshipPermitted = true;

    // determine if relationship can be created
    const existingRelationship = sourceActor.items.find((i) => {
      return i.name === targetActor.name;
    });
    if (!this.isItemPermitted("relationship")) {
      LOGGER.trace("Relationships are not permitted for this actor type.");
    } else if (existingRelationship) {
      LOGGER.trace(`${sourceActor.name} already has a relationship with ${targetActor.name}.`);
      isRelationshipPermitted = false;
    } else {
      LOGGER.trace(`${sourceActor.name} does not yet have a relationship with ${targetActor.name}.`);
    }

    // create relationship
    if (isRelationshipPermitted) {
      LOGGER.trace(`Creating relationship with ${targetActor.name} for ${sourceActor.name}`);
      let relationshipDataObject = {
        id: targetId,
        type: "relationship",
        name: targetActor.name,
        img: targetActor.img,
        disposition: "Indifferent",
        description: "",
        system: {targetId: targetId}
      }
      // this.actor.items.push({ key: targetId, value: relationshipDataObject })
      this.actor.createEmbeddedDocuments("Item", [relationshipDataObject])
          .then(function(result) {
            embeddedItem.concat(result);
          });
    }

    return embeddedItem;
  }

}
