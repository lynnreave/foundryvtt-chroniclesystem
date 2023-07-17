import { ActorChronicle } from "../actor-chronicle.js";
import {
  addTransformer,
  getTransformation,
  removeAllTransformersFromSource,
  removeTransformer,
  saveTransformers,
  updateTempTransformers
} from "./transformers.js";
import {
  getAbilities,
  getAbility,
  getAbilityBySpecialty,
  getAbilityValue
} from "./abilities.js";
import {
  calculateCombatDefense,
  calculateMovementData
} from "./calculations.js";

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

  calculateMovementData() { calculateMovementData(this); }

  calcCombatDefense() { return calculateCombatDefense(this); }

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

  _onDeleteDescendantDocuments(embeddedName, documents, result, options, userId) {
    super._onDeleteDescendantDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempTransformers();
    for (let i = 0; i < documents.length; i++) {
      let documentToDelete = documents[i]
      removeAllTransformersFromSource(this, documentToDelete._id)
      documentToDelete.onDiscardedFromActor(this, result[0]);
    }
    this.saveTransformers();
  }

  _onCreateDescendantDocuments(embeddedName, documents, result, options, userId) {
    super._onCreateDescendantDocuments(
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

  _onUpdateDescendantDocuments(embeddedName, documents, result, options, userId) {
    super._onUpdateDescendantDocuments(
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
    this.saveTransformers();
  }
}
