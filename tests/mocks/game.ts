import {
  CHARACTER_ATTR_CONSTANTS,
  KEY_CONSTANTS
// @ts-ignore
} from "@module/constants";

export class TestSettingsSystemASOIAFTrue {
  static get(systemName: string, defense_style: string) { return true; }
}

export class TestSettingsSystemASOIAFFalse {
  static get(systemName: string, defense_style: string) { return false; }
}

class i18n {
  static localize(s) {
    switch(s) {
      case CHARACTER_ATTR_CONSTANTS.BULK:
        return "bulk";
      case KEY_CONSTANTS.AWARENESS:
        return "awareness";
      case KEY_CONSTANTS.ATHLETICS:
        return "athletics";
      case KEY_CONSTANTS.AGILITY:
        return "agility";
      case KEY_CONSTANTS.CUNNING:
        return "cunning";
      case KEY_CONSTANTS.DECEPTION:
        return "deception";
      case KEY_CONSTANTS.PERSUASION:
        return "persuasion";
      case KEY_CONSTANTS.RUN:
        return "run";
      case KEY_CONSTANTS.STATUS:
        return "status";
      case KEY_CONSTANTS.STRENGTH:
        return "strength";
    }
  }
}

/**
 * A game mock for use in testing.
 */
export class TestGame {
  i18n = i18n;
  user = {
    targets: []
  };
}