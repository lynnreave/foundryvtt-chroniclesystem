// Import modules
import actorConstructor from "./actor/actor-constructor.js";
import { CSAbilityItemSheet } from "./item/sheets/csAbilityItemSheet.js";
import { CombatChronicle } from "./combat/combat-chronicle.js";
import { CombatantChronicle } from "./combat/combatant-chronicle.js";
import { CharacterSheet } from "./actor/character/character/character-sheet.js";
import { CSEventItemSheet } from "./item/sheets/csEventItemSheet.js";
import { CSHoldingItemSheet } from "./item/sheets/csHoldingItemSheet.js";
import { HouseSheet } from "./actor/house/house-sheet.js";
import { ItemSheetChronicle } from "./item/item-sheet-chronicle.js";
import { CSRelationshipItemSheet } from "./item/sheets/csRelationshipItemSheet.js";
import { CSTechniqueItemSheet } from "./item/sheets/cs-technique-item-sheet.js";
import { EffectSheet } from "./item/effect/effect-sheet.js";
import { WeaponSheet } from "./item/weapon/weapon-sheet.js";
import { UnitSheet } from "./actor/character/unit/unit-sheet.js";
import itemConstructor from "./item/item-constructor.js";
import LOGGER from "../util/logger.js";
import { migrateData } from "./migration/migration.js";
import { preloadHandlebarsTemplates } from "./system/preloadTemplates.js";
import { registerCustomHelpers } from "./system/handlebarsHelpers.js";
import registerSystemSettings from "./system/settings.js";
import SystemUtils from "../util/systemUtils.js";
import { ActionCombatSheet } from "./item/action/action-combat-sheet.js";
import { OrderSheet } from "./item/order/order-sheet.js";
import { MountSheet } from "./item/mount/mount-sheet.js";

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
  Items.registerSheet("chroniclesystem", CSAbilityItemSheet, {
    label: SystemUtils.localize("CS.sheets.abilityItemSheet"),
    types: ["ability"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", ActionCombatSheet, {
    label: SystemUtils.localize("CS.sheets.actionCombatSheet"),
    types: ["actionCombat"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", ItemSheetChronicle, {
    label: SystemUtils.localize("CS.sheets.itemSheet"),
    types: ["actionIntrigue", "armor", "benefit", "drawback", "equipment"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", EffectSheet, {
    label: SystemUtils.localize("CS.sheets.effectItemSheet"),
    types: ["effect"],
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
  Items.registerSheet("chroniclesystem", MountSheet, {
    label: SystemUtils.localize("CS.sheets.mountItemSheet"),
    types: ["mount"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", OrderSheet, {
    label: SystemUtils.localize("CS.sheets.orderItemSheet"),
    types: ["order"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSRelationshipItemSheet, {
    label: SystemUtils.localize("CS.sheets.relationshipItemSheet"),
    types: ["relationship"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", CSTechniqueItemSheet, {
    label: SystemUtils.localize("CS.sheets.techniqueItemSheet"),
    types: ["technique"],
    makeDefault: true,
  });
  Items.registerSheet("chroniclesystem", WeaponSheet, {
    label: SystemUtils.localize("CS.sheets.weaponItemSheet"),
    types: ["weapon"],
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
