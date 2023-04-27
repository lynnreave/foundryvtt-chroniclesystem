import {
  CHARACTER_ATTR_CONSTANTS,
  DEFAULT_MOVEMENT,
  KEY_CONSTANTS,
  SETTINGS
} from "../../constants.js";
import { getAbilityTestFormula } from "../../roll/rolls.js";
import { getAbilityValue } from "./abilities.js";
import { getData } from "../../common.js";
import { getTransformation } from "./transformers.js";
import SystemUtils from "../../../util/systemUtils.js";

export function calculateCombatDefense(character) {
  /**
   * Calculate the combat defense data for a character Actor.
   *
   * @param {object} character: a character Actor object.
   */
  // get the default value
  let value =
    getAbilityValue(character, SystemUtils.localize(KEY_CONSTANTS.AWARENESS)) +
    getAbilityValue(character, SystemUtils.localize(KEY_CONSTANTS.AGILITY)) +
    getAbilityValue(character, SystemUtils.localize(KEY_CONSTANTS.ATHLETICS));
  // update w/ ASOIAF-specific rules
  // eslint-disable-next-line no-undef
  if (game.settings.get(SETTINGS.SYSTEM_NAME, SETTINGS.ASOIAF_DEFENSE_STYLE)) {
    let mod = getTransformation(
      character,
      "modifiers",
      CHARACTER_ATTR_CONSTANTS.COMBAT_DEFENSE
    );
    value += mod.total;
  }
  // return
  return value;
}

export function calculateMovementData(character) {
  /**
   * Calculate the movement data for a character Actor.
   *
   * @param {object} character: a character Actor object.
   */
  // get character system data
  let data = getData(character);
  // get movement base
  data.movement.base = DEFAULT_MOVEMENT;
  // get run bonus
  let runFormula = getAbilityTestFormula(
    character,
    SystemUtils.localize(KEY_CONSTANTS.ATHLETICS),
    SystemUtils.localize(KEY_CONSTANTS.RUN)
  );
  data.movement.runBonus = Math.floor(runFormula.bonusDice / 2);
  // get bulk
  let bulkMod = getTransformation(
    character,
    "modifiers",
    SystemUtils.localize(CHARACTER_ATTR_CONSTANTS.BULK)
  );
  data.movement.bulk = Math.floor(bulkMod.total / 2);
  // get movement modifier
  data.movement.modifier = getTransformation(
    character,
    "modifiers",
    CHARACTER_ATTR_CONSTANTS.MOVEMENT,
    false,
    true
  ).total;
  // get total (min 1)
  data.movement.total = Math.max(
    data.movement.base +
      data.movement.runBonus -
      data.movement.bulk +
      data.movement.modifier,
    1
  );
  // get sprint total
  data.movement.sprintTotal =
    data.movement.total * data.movement.sprintMultiplier - data.movement.bulk;
}
