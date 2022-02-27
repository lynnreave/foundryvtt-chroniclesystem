/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { ChronicleSystemActor } from "./actors/actor.js";
import { ChronicleSystemItem } from "./items/chronicleSystemItem.js";
import { ChronicleSystemItemSheet } from "./item-sheet.js";
import { ChronicleSystemActorSheet } from "./actors/actor-sheet.js";
import { preloadHandlebarsTemplates } from "./preloadTemplates.js";
import { registerCustomHelpers } from "./handlebarsHelpers.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
    console.log(`Initializing Simple Worldbuilding System`);

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
	    formula: "1d20",
        decimals: 2
    };

    registerCustomHelpers();

	// Define custom Entity classes
    CONFIG.Actor.documentClass = ChronicleSystemActor;
    CONFIG.Item.documentClass = ChronicleSystemItem;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("chroniclesystem", ChronicleSystemActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("chroniclesystem", ChronicleSystemItemSheet, {makeDefault: true});

    // Register system settings
    game.settings.register("worldbuilding", "macroShorthand", {
        name: "Shortened Macro Syntax",
        hint: "Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });
    await preloadHandlebarsTemplates();
});

Hooks.on('preCreateItem', (item, data) => {
    item.data.update({
        img: `systems/chroniclesystem/assets/icons/${data.type}.png`
    },{diff:true});
});

// Hooks.on('createActor', async (actor, options, userId) => {
//     if (actor.data.type === 'character' && options.renderSheet) {
//         const abilitiesToFind = [
//             'Athletics',
//             'Common Knowledge',
//             'Notice',
//             'Persuasion',
//             'Stealth',
//             'Untrained',
//         ];
//         const abilityIndex = (await game.packs
//             .get('chroniclesystem.abilities')
//             .getContent());
//         actor.createEmbeddedEntity('OwnedItem', abilityIndex.filter((i) => abilitiesToFind.includes(i.data.name)));
//     }
// });