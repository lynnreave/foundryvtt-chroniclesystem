import SystemUtils from "../../../util/systemUtils.js";
import { ActorChronicle } from "../actor-chronicle.js";
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import { CSConstants } from "../../system/csConstants.js";
import {
  addTransformer, getTransformation, removeTransformer, saveTransformers, updateTempTransformers
} from "./transformers.js";
import {
  getAbilities, getAbility, getAbilityBySpecialty, getAbilityValue
} from "./abilities.js";

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

  getAbilities() { return getAbilities(this); }

  getAbility(abilityName) { return getAbility(this, abilityName); }

  getAbilityBySpecialty(abilityName, specialtyName) {
    return getAbilityBySpecialty(this, abilityName, specialtyName);
  }

  getAbilityValue(abilityName) { return getAbilityValue(this, abilityName); }

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
