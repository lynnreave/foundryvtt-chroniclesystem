// Import modules
import actorConstructor from "./actor/actor-constructor.js";
import { CSAbilityItemSheet } from "./item/sheets/csAbilityItemSheet.js";
import { CombatChronicle } from "./combat/combat-chronicle.js";
import { CombatantChronicle } from "./combat/combatant-chronicle.js";
import { CharacterSheet } from "./actor/character/character-sheet.js";
import { CSEventItemSheet } from "./item/sheets/csEventItemSheet.js";
import { CSHoldingItemSheet } from "./item/sheets/csHoldingItemSheet.js";
import { HouseSheet } from "./actor/house/house-sheet.js";
import { CSItemSheet } from "./item/sheets/csItemSheet.js";
import { CSRelationshipItemSheet } from "./item/sheets/csRelationshipItemSheet.js";
import { CSTechniqueItemSheet } from "./item/sheets/cs-technique-item-sheet.js";
import { UnitSheet } from "./actor/character/unit/unit-sheet.js";
import itemConstructor from "./item/itemConstructor.js";
import LOGGER from "../util/logger.js";
import { migrateData } from "./migration/migration.js";
import { preloadHandlebarsTemplates } from "./system/preloadTemplates.js";
import { registerCustomHelpers } from "./system/handlebarsHelpers.js";
import registerSystemSettings from "./system/settings.js";
import SystemUtils from "../util/systemUtils.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  LOGGER.log("Loading Chronicle System (Unofficial)");

  // Create a chronicle namespace within the game global
  game["chronicle"] = {}
  // TODO: add quench tests

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2,
  };

  // Register custom helpers
  registerCustomHelpers();

  // Define custom Entity classes
  CONFIG.Actor.documentClass = actorConstructor;
  CONFIG.Item.documentClass = itemConstructor;
  CONFIG.Combat.documentClass = CombatChronicle;
  CONFIG.Combatant.documentClass = CombatantChronicle;

  // Register sheet application classes
  // actors
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("chroniclesystem", CharacterSheet, {
    label: SystemUtils.localize("CS.sheets.characterSheet"),
    types: ["character"],
    makeDefault: true,
  });
  Actors.registerSheet("chroniclesystem", HouseSheet, {
    label: SystemUtils.localize("CS.sheets.houseSheet"),
    types: ["house"],
    makeDefault: true,
  });
  Actors.registerSheet("chroniclesystem", UnitSheet, {
    label: SystemUtils.localize("CS.sheets.unitSheet"),
    types: ["unit"],
    makeDefault: true,
  });
  // items
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("chroniclesystem", CSItemSheet, {
    label: SystemUtils.localize("CS.sheets.itemSheet"),
    types: ["armor", "weapon", "equipment", "benefit", "drawback"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSAbilityItemSheet, {
    label: SystemUtils.localize("CS.sheets.abilityItemSheet"),
    types: ["ability"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSEventItemSheet, {
    label: SystemUtils.localize("CS.sheets.eventItemSheet"),
    types: ["event"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSHoldingItemSheet, {
    label: SystemUtils.localize("CS.sheets.holdingItemSheet"),
    types: ["holding"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSTechniqueItemSheet, {
    label: SystemUtils.localize("CS.sheets.techniqueItemSheet"),
    types: ["technique"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSRelationshipItemSheet, {
    label: SystemUtils.localize("CS.sheets.relationshipItemSheet"),
    types: ["relationship"],
    makeDefault: true,
  });

  registerSystemSettings();
  await preloadHandlebarsTemplates();
});

Hooks.once("ready", async () => {
  await migrateData();
});

Hooks.on("createItem", (item, data) => {
  if (!item.isOwned) {
    item.img = `systems/chroniclesystem/assets/icons/${item.type}.png`;
  }
});
