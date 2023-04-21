import SystemUtils from "../../../util/systemUtils.js";
import LOGGER from "../../../util/logger.js";
import { ActorChronicle } from "../actor-chronicle.js";
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import { CSConstants } from "../../system/csConstants.js";

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
    let bulkMod = this.getModifier(
      SystemUtils.localize(ChronicleSystem.modifiersConstants.BULK)
    );
    data.movement.bulk = Math.floor(bulkMod.total / 2);
    data.movement.modifier = this.getModifier(
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
      let mod = this.getModifier(
        ChronicleSystem.modifiersConstants.COMBAT_DEFENSE
      );
      value += mod.total;
    }

    return value;
  }

  // TODO: consolidate these?
  getModifier(type, includeDetail = false, includeModifierGlobal = false) {
    this.updateTempModifiers();

    let total = 0;
    let detail = [];

    if (this.modifiers[type]) {
      this.modifiers[type].forEach((modifier) => {
        total += modifier.mod;
        if (includeDetail) {
          let tempItem = modifier._id;
          if (modifier.isDocument) {
            tempItem = this.getEmbeddedDocument("Item", modifier._id);
          }
          if (tempItem) {
            detail.push({ docName: tempItem.name, mod: modifier.mod });
          }
        }
      });
    }

    if (
      includeModifierGlobal &&
      this.modifiers[ChronicleSystem.modifiersConstants.ALL]
    ) {
      this.modifiers[ChronicleSystem.modifiersConstants.ALL].forEach(
        (modifier) => {
          total += modifier.mod;
          if (includeDetail) {
            let tempItem = modifier._id;
            if (modifier.isDocument) {
              tempItem = this.getEmbeddedDocument("Item", modifier._id);
            }
            if (tempItem)
              detail.push({ docName: tempItem.name, mod: modifier.mod });
          }
        }
      );
    }

    return { total: total, detail: detail };
  }

  getPenalty(type, includeDetail = false, includeModifierGlobal = false) {
    this.updateTempPenalties();

    let total = 0;
    let detail = [];

    if (this.penalties[type]) {
      this.penalties[type].forEach((penalty) => {
        total += penalty.mod;
        if (includeDetail) {
          let tempItem = penalty._id;
          if (penalty.isDocument) {
            tempItem = this.getEmbeddedDocument("Item", penalty._id);
          }
          if (tempItem) {
            detail.push({ docName: tempItem.name, mod: penalty.mod });
          }
        }
      });
    }

    if (
      includeModifierGlobal &&
      this.penalties[ChronicleSystem.modifiersConstants.ALL]
    ) {
      this.penalties[ChronicleSystem.modifiersConstants.ALL].forEach(
        (penalty) => {
          total += penalty.mod;
          if (includeDetail) {
            let tempItem = penalty._id;
            if (penalty.isDocument) {
              tempItem = this.getEmbeddedDocument("Item", penalty._id);
            }
            if (tempItem)
              detail.push({ docName: tempItem.name, mod: penalty.mod });
          }
        }
      );
    }

    return { total: total, detail: detail };
  }

  getBonus(type, includeDetail = false, includeModifierGlobal = false) {
    this.updateTempBonuses();

    let total = 0;
    let detail = [];

    if (this.bonuses[type]) {
      this.bonuses[type].forEach((bonus) => {
        total += bonus.mod;
        if (includeDetail) {
          let tempItem = bonus._id;
          if (bonus.isDocument) {
            tempItem = this.getEmbeddedDocument("Item", bonus._id);
          }
          if (tempItem) {
            detail.push({ docName: tempItem.name, mod: bonus.mod });
          }
        }
      });
    }

    if (
      includeModifierGlobal &&
      this.bonuses[ChronicleSystem.modifiersConstants.ALL]
    ) {
      this.bonuses[ChronicleSystem.modifiersConstants.ALL].forEach((bonus) => {
        total += bonus.mod;
        if (includeDetail) {
          let tempItem = bonus._id;
          if (bonus.isDocument) {
            tempItem = this.getEmbeddedDocument("Item", bonus._id);
          }
          if (tempItem) detail.push({ docName: tempItem.name, mod: bonus.mod });
        }
      });
    }

    return { total: total, detail: detail };
  }

  // TODO: consolidate these functions
  // TODO: push up to parent Actor?
  addModifier(type, documentId, value, isDocument = true, save = false) {
    LOGGER.trace(`add ${documentId} modifier to ${type} | Character`);

    console.assert(
      this.modifiers,
      "call actor.updateTempModifiers before adding a modifier!"
    );

    if (!this.modifiers[type]) {
      this.modifiers[type] = [];
    }

    let index = this.modifiers[type].findIndex((mod) => {
      return mod._id === documentId;
    });
    if (index >= 0) {
      this.modifiers[type][index].mod = value;
    } else {
      this.modifiers[type].push({
        _id: documentId,
        mod: value,
        isDocument: isDocument,
      });
    }

    if (save) {
      this.update({ "system.modifiers": this.modifiers });
    }
  }

  addPenalty(type, documentId, value, isDocument = true, save = false) {
    LOGGER.trace(`add ${documentId} penalty to ${type} | Character`);

    console.assert(
      this.penalties,
      "call actor.updateTempPenalties before adding a penalty!"
    );

    if (!this.penalties[type]) {
      this.penalties[type] = [];
    }

    let index = this.penalties[type].findIndex((mod) => {
      return mod._id === documentId;
    });

    if (index >= 0) {
      this.penalties[type][index].mod = value;
    } else {
      this.penalties[type].push({
        _id: documentId,
        mod: value,
        isDocument: isDocument,
      });
    }

    if (save) {
      this.update({ "system.penalties": this.penalties });
    }
  }

  addBonus(type, documentId, value, isDocument = true, save = false) {
    LOGGER.trace(`add ${documentId} bonus to ${type} | Character`);

    console.assert(
      this.bonuses,
      "call actor.updateTempBonuses before adding a bonus!"
    );

    if (!this.bonuses[type]) {
      this.bonuses[type] = [];
    }

    let index = this.bonuses[type].findIndex((mod) => {
      return mod._id === documentId;
    });

    if (index >= 0) {
      this.bonuses[type][index].mod = value;
    } else {
      this.bonuses[type].push({
        _id: documentId,
        mod: value,
        isDocument: isDocument,
      });
    }

    if (save) {
      this.update({ "system.bonuses": this.bonuses });
    }
  }

  // TODO: consolidate these functions
  removeModifier(type, documentId, save = false) {
    LOGGER.trace(`remove ${documentId} modifier to ${type} | Character`);

    console.assert(
      this.modifiers,
      "call actor.updateTempModifiers before removing a modifier!"
    );

    if (this.modifiers[type]) {
      let index = this.modifiers[type].indexOf((mod) => mod._id === documentId);
      this.modifiers[type].splice(index, 1);
    }
    if (save) this.update({ "data.modifiers": this.modifiers });
  }

  removePenalty(type, documentId, save = false) {
    LOGGER.trace(`remove ${documentId} penalty to ${type} | Character`);

    console.assert(
      this.penalties,
      "call actor.updateTempPenalties before removing a penalty!"
    );

    if (this.penalties[type]) {
      let index = this.penalties[type].indexOf((mod) => mod._id === documentId);
      this.penalties[type].splice(index, 1);
    }
    if (save) this.update({ "data.penalties": this.penalties });
  }

  removeBonus(type, documentId, save = false) {
    LOGGER.trace(`remove ${documentId} bonus to ${type} | Character`);

    console.assert(
      this.bonuses,
      "call actor.updateTempBonuses before removing a bonus!"
    );

    if (this.bonuses[type]) {
      let index = this.bonuses[type].indexOf((mod) => mod._id === documentId);
      this.bonuses[type].splice(index, 1);
    }
    if (save) this.update({ "system.penalties": this.bonuses });
  }

  // TODO: consolidate these?
  saveModifiers() {
    console.assert(
      this.modifiers,
      "call actor.updateTempModifiers before saving the modifiers!"
    );
    this.update({ "system.modifiers": this.modifiers }, { diff: false });
  }

  savePenalties() {
    console.assert(
      this.penalties,
      "call actor.updateTempPenalties before saving the penalties!"
    );
    this.update({ "data.penalties": this.penalties }, { diff: false });
  }

  saveBonuses() {
    console.assert(
      this.bonuses,
      "call actor.updateTempBonuses before saving the bonuses!"
    );
    this.update({ "system.bonuses": this.bonuses }, { diff: false });
  }

  updateTempModifiers() {
    let data = this.getData();
    this.modifiers = data.modifiers;
  }

  updateTempPenalties() {
    let data = this.getData();
    this.penalties = data.penalties;
  }

  updateTempBonuses() {
    let data = this.getData();
    this.bonuses = data.bonuses;
  }

  _onDeleteEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    super._onDeleteEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempModifiers();
    for (let i = 0; i < documents.length; i++) {
      documents[i].onDiscardedFromActor(this, result[0]);
    }
    this.saveModifiers();
  }

  _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    super._onCreateEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempModifiers();
    for (let i = 0; i < documents.length; i++) {
      documents[i].onObtained(this);
    }

    this.saveModifiers();
  }

  _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    super._onUpdateEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
    this.updateTempModifiers();
    result.forEach((doc) => {
      let item = this.items.find((item) => item._id === doc._id);
      if (item) {
        item.onObtained(this);
        item.onEquippedChanged(this, item.getCSData().equipped > 0);
      }
    });
    this.saveModifiers();
  }
}
