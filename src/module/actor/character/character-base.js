import SystemUtils from "../../../util/systemUtils.js";
import LOGGER from "../../../util/logger.js";
import { ActorChronicle } from "../actor-chronicle.js";
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import { CSConstants } from "../../system/csConstants.js";
import {
  addTransformer, getTransformation, removeTransformer, saveTransformers, updateTempTransformers
} from "./transformers.js";

/**
 * The base Actor entity for Character Actor types.
 *
 * @category Actor
 */
export class CharacterBase extends ActorChronicle {
  modifiers;
  penalties;
  bonuses;

  prepareData() {
    super.prepareData();
    this.calculateMovementData();
  }

  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.calculateDerivedValues();
  }

  /** @override */
  getRollData() {
    return super.getRollData();
  }

  getAbilities() {
    let items = this.getEmbeddedCollection("Item");
    return items.filter((item) => item.type === "ability");
  }

  getAbility(abilityName) {
    let items = this.getEmbeddedCollection("Item");
    const ability = items.find(
      (item) =>
        item.name.toLowerCase() === abilityName.toString().toLowerCase() &&
        item.type === "ability"
    );
    return [ability, undefined];
  }

  getAbilityBySpecialty(abilityName, specialtyName) {
    let items = this.getEmbeddedCollection("Item");
    let specialty = null;
    const ability = items
      .filter(
        (item) =>
          item.type === "ability" &&
          item.name.toLowerCase() === abilityName.toString().toLowerCase()
      )
      .find(function (ability) {
        let data = ability.getCSData();
        if (data.specialties === undefined) return false;

        // convert specialties list to array
        let specialties = data.specialties;
        let specialtiesArray = Object.keys(specialties).map(
          (key) => specialties[key]
        );

        specialty = specialtiesArray.find(
          (specialty) =>
            specialty.name.toLowerCase() ===
            specialtyName.toString().toLowerCase()
        );
        if (specialty !== null && specialty !== undefined) {
          return true;
        }
      });

    return [ability, specialty];
  }

  getAbilityValue(abilityName) {
    const [ability] = this.getAbility(abilityName);
    return ability !== undefined ? ability.getCSData().rating : 2;
  }

  calculateMovementData() {
    let data = this.getData();
    data.movement.base = ChronicleSystem.defaultMovement;
    let runFormula = ChronicleSystem.getActorAbilityFormula(
      this,
      SystemUtils.localize(ChronicleSystem.keyConstants.ATHLETICS),
      SystemUtils.localize(ChronicleSystem.keyConstants.RUN)
    );
    data.movement.runBonus = Math.floor(runFormula.bonusDice / 2);
    let bulkMod = this.getTransformation("modifiers",
      SystemUtils.localize(ChronicleSystem.modifiersConstants.BULK)
    );
    data.movement.bulk = Math.floor(bulkMod.total / 2);
    data.movement.modifier = this.getTransformation("modifiers",
      ChronicleSystem.modifiersConstants.MOVEMENT,
      false,
      true
    ).total;
    data.movement.total = Math.max(
      data.movement.base +
        data.movement.runBonus -
        data.movement.bulk +
        data.movement.modifier,
      1
    );
    data.movement.sprintTotal =
      data.movement.total * data.movement.sprintMultiplier - data.movement.bulk;
  }

  calcCombatDefense() {
    let value =
      this.getAbilityValue(
        SystemUtils.localize(ChronicleSystem.keyConstants.AWARENESS)
      ) +
      this.getAbilityValue(
        SystemUtils.localize(ChronicleSystem.keyConstants.AGILITY)
      ) +
      this.getAbilityValue(
        SystemUtils.localize(ChronicleSystem.keyConstants.ATHLETICS)
      );

    if (
      game.settings.get(
        CSConstants.Settings.SYSTEM_NAME,
        CSConstants.Settings.ASOIAF_DEFENSE_STYLE
      )
    ) {
      let mod = this.getTransformation("modifiers",
        ChronicleSystem.modifiersConstants.COMBAT_DEFENSE
      );
      value += mod.total;
    }

    return value;
  }

  getTransformation(
      type, attr, includeDetail = false, includeModifierGlobal = false
  ) {
    return getTransformation(this, type, attr, includeDetail, includeModifierGlobal)
  }

  addTransformer(type, attr, sourceId, value, isDocument = true, save = false) {
    addTransformer(this, type, attr, sourceId, value, isDocument, save);
  }

  removeTransformer(type, attr, sourceId, save = false) {
    removeTransformer(this, type, attr, sourceId, save);
  }

  saveTransformers() { saveTransformers(this); }

  updateTempTransformers() { updateTempTransformers(this) }

  _onDeleteEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    super._onDeleteEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempTransformers();
    for (let i = 0; i < documents.length; i++) {
      documents[i].onDiscardedFromActor(this, result[0]);
    }
    // this.saveModifiers();
    this.saveTransformers();
  }

  _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    super._onCreateEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempTransformers();
    for (let i = 0; i < documents.length; i++) {
      documents[i].onObtained(this);
    }

    // this.saveModifiers();
    this.saveTransformers();
  }

  _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    super._onUpdateEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempTransformers();
    result.forEach((doc) => {
      let item = this.items.find((item) => item._id === doc._id);
      if (item) {
        item.onObtained(this);
        item.onEquippedChanged(this, item.getCSData().equipped > 0);
      }
    });
    // this.saveModifiers();
    this.saveTransformers();
  }
}
