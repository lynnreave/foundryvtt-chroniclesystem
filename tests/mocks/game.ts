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
      case KEY_CONSTANTS.RUN:
        return "run";
    }
  }
}

/**
 * A game mock for use in testing.
 */
export class TestGame {
  i18n = i18n;
}