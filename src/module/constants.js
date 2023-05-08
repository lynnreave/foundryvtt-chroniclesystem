/**
 * Used primarily for transformer attribute targets on Character objects.
 * @type {object}
 */
export const CHARACTER_ATTR_CONSTANTS = {
  ALL: "all",
  PENALTY: "penalty",

  AGILITY: "agility",
  AWARENESS: "awareness",
  CUNNING: "cunning",
  DECEPTION: "deception",
  ENDURANCE: "endurance",
  FIGHTING: "fighting",
  MARKSMANSHIP: "marksmanship",
  PERSUASION: "persuasion",
  STATUS: "status",
  THIEVERY: "thievery",

  BULK: "bulk",
  DAMAGE_TAKEN: "damage_resistance",
  COMPOSURE_RESISTANCE: "composure_resistance",
  COMBAT_DEFENSE: "combat_defense",
  COMBAT_DEFENSE_FIGHTING: "combat_defense_fighting",
  COMBAT_DEFENSE_MARKSMANSHIP: "combat_defense_marksmanship",
  MOVEMENT: "movement",
  DISCIPLINE: "discipline",
};

/**
 * Degrees of success/failure to string.
 * @type {object}
 */
export const DEGREES_CONSTANTS = {
  "-2": "CS.degrees.criticalFailure",
  "-1": "CS.degrees.marginalFailure",
  "1": "CS.degrees.marginalSuccess",
  "2": "CS.degrees.greatSuccess",
  "3": "CS.degrees.incredibleSuccess",
  "4": "CS.degrees.astonishingSuccess"
};

/**
 * Equipped statuses for owned Item objects.
 * @type {object}
 */
export const EQUIPPED_CONSTANTS = {
  IS_NOT_EQUIPPED: 0,
  WEARING: 1,
  MAIN_HAND: 2,
  OFFHAND: 3,
  BOTH_HANDS: 4,
  COMMANDER: 5,
  DEFENDING: 6
};

/**
 * The default movement units for all Actors.
 * @type {number}
 */
export const DEFAULT_MOVEMENT = 4;

/**
 * Used for sourceId values when adding transformers to Character objects.
 * @type {object}
 */
export const KEY_CONSTANTS = {
  AGILITY: "CS.constants.abilities.agility",
  ATHLETICS: "CS.constants.abilities.athletics",
  AWARENESS: "CS.constants.abilities.awareness",
  CUNNING: "CS.constants.abilities.cunning",
  DECEPTION: "CS.constants.abilities.deception",
  PERSUASION: "CS.constants.abilities.persuasion",
  ENDURANCE: "CS.constants.abilities.endurance",
  MARKSMANSHIP: "CS.constants.abilities.marksmanship",
  STATUS: "CS.constants.abilities.status",
  THIEVERY: "CS.constants.abilities.thievery",
  WILL: "CS.constants.abilities.will",

  RUN: "CS.constants.specialties.run",
  BLUFF: "CS.constants.specialties.bluff",
  ACT: "CS.constants.specialties.act",
  BARGAIN: "CS.constants.specialties.bargain",
  CHARM: "CS.constants.specialties.charm",
  CONVINCE: "CS.constants.specialties.convince",
  INCITE: "CS.constants.specialties.incite",
  INTIMIDATE: "CS.constants.specialties.intimidate",
  SEDUCE: "CS.constants.specialties.seduce",
  TAUNT: "CS.constants.specialties.taunt",
  STEWARDSHIP: "CS.constants.specialties.stewardship",
  STRENGTH: "CS.constants.specialties.strength",

  BULK: "CS.constants.qualities.bulk",

  WOUNDS: "CS.constants.others.wounds",
  INJURY: "CS.constants.others.injuries",
  FRUSTRATION: "CS.constants.others.frustrations",
  STRESS: "CS.constants.others.stress",
  FATIGUE: "CS.constants.others.fatigue",
  DISORGANISATION: "CS.constants.others.disorganisation",
  DISCIPLINE: "CS.constants.others.discipline",
  ORDERS_RECEIVED: "CS.constants.others.ordersReceived",
  FACING: "CS.constants.others.facing",
  FORMATION: "CS.constants.others.formation",
  HEROES: "CS.constants.others.heroes",
  DISPOSITION: "CS.constants.others.disposition"
};

/**
 * GameClient settings.
 * @type {object}
 */
export const SETTINGS = {
  SYSTEM_NAME: "chroniclesystem",
  ASOIAF_DEFENSE_STYLE: "asoiafDefenseStyle",
  TRACE_LOGS: "traceLogs",
  DEBUG_LOGS: "debugLogs",
  CURRENT_VERSION: "version",
  MODIFIER_DIALOG_AS_DEFAULT: "isModifierDialogDefault",
};
