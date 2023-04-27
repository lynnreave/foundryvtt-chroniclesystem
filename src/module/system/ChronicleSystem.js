import {DiceRollFormula} from "../roll/dice-roll-formula.js";
import LOGGER from "../../util/logger.js";
import {RollChronicle} from "../roll/roll-chronicle.js";
import {CSConstants} from "./csConstants.js";
import SystemUtils from "../../util/systemUtils.js";
import {
    CHARACTER_ATTR_CONSTANTS,
    DEFAULT_MOVEMENT,
    EQUIPPED_CONSTANTS,
    KEY_CONSTANTS
} from "../constants.js";
import {
    getAbilityTestFormula,
    getFormula
} from "../roll/rolls.js";
import {
    CHARACTER_DISPOSITIONS,
    UNIT_FACINGS,
    UNIT_FORMATIONS,
    UNIT_STATUSES
} from "../selections.js";

export const ChronicleSystem ={}

window.ChronicleSystem = ChronicleSystem;

ChronicleSystem.LastActor = null;

ChronicleSystem.SetLastActor = function (actor) {
    if (actor !== ChronicleSystem.LastActor)
        LOGGER.debug(`Setting Last Actor: ${actor?.name}`);
    ChronicleSystem.LastActor = actor
}

ChronicleSystem.ClearLastActor = function (actor) {
    if (ChronicleSystem.LastActor === actor) {
        LOGGER.debug(`Clearing Last Actor: ${ChronicleSystem.LastActor?.name}`);
        ChronicleSystem.LastActor = null
        ChronicleSystem.LastActorName = null
        const tokens = canvas.tokens
        if (tokens && tokens.controlled.length > 0) {
            ChronicleSystem.SetLastActor(tokens.controlled[0].actor)
        } // There may still be tokens selected... if so, select one of them
    }
}

function escapeUnicode(str) {
    return str.replace(/[^\0-~]/g, function (ch) {
        return '&#x' + ('0000' + ch.charCodeAt(0).toString(16).toUpperCase()).slice(-4) + ';'
    })
}

function trim(s) {
    return s.replace(/^\s*$(?:\r\n?|\n)/gm, '').trim() // /^\s*[\r\n]/gm
}

ChronicleSystem.trim = trim
ChronicleSystem.escapeUnicode = escapeUnicode

async function eventHandleRoll(event, actor) {
    event.preventDefault();
    let showModifierDialog = false;
    if (event.shiftKey) {
        showModifierDialog = true;
    }
    const rollType = event.currentTarget.id;
    await ChronicleSystem.handleRollAsync(rollType, actor, showModifierDialog);
}

function handleRoll(rollType, actor) {
    const roll_definition = rollType.split(':');
    if (roll_definition.length < 2)
        return;

    const formula = getFormula(roll_definition, actor);

    let csRoll = new RollChronicle(roll_definition[1], formula);
    return csRoll.doRoll(actor, false);
}

async function _showModifierDialog(formula) {
    const template = CSConstants.Templates.Dialogs.ROLL_MODIFIER;
    const html = await renderTemplate(template, {formula: formula});
    return new Promise(resolve => {
        const data = {
            title: SystemUtils.localize("CS.dialogs.rollModifier.title"),
            content: html,
            buttons: {
                normal: {
                    label: SystemUtils.localize("CS.dialogs.actions.confirm"),
                    callback: html => resolve({data: html[0].querySelector("form")})
                },
                cancel: {
                    label: SystemUtils.localize("CS.dialogs.actions.cancel"),
                    callback: html => resolve({cancelled: true})
                }
            },
            default: "normal",
            close: () => resolve({cancelled: true})
        };
        new Dialog(data, null).render(true);
    })
}

async function handleRollAsync(rollType, actor, showModifierDialog = false) {
    const roll_definition = rollType.split(':');
    if (roll_definition.length < 2)
        return;
    let formula = getFormula(roll_definition, actor);

    const revertModifierDialog = game.settings.get(CSConstants.Settings.SYSTEM_NAME, CSConstants.Settings.MODIFIER_DIALOG_AS_DEFAULT);

    if (showModifierDialog ? !revertModifierDialog : revertModifierDialog) {
        let form = await _showModifierDialog(formula);
        if (!form.cancelled) {
            const formulaChanged = new DiceRollFormula();
            formulaChanged.pool = form.data.pool.value;
            formulaChanged.bonusDice = form.data.bonusDice.value;
            formulaChanged.reRoll = form.data.reRoll.value;
            formulaChanged.modifier = form.data.modifier.value;
            formulaChanged.dicePenalty = form.data.dicePenalty.value;

            if (formulaChanged.toStr() !== formula.toStr()) {
                formulaChanged.isUserChanged = true;
                formula = formulaChanged;
            }
        } else {
            return new Promise((resolve)=> resolve = new Roll('') );
        }
    }

    let csRoll = new RollChronicle(roll_definition[1], formula);
    return await csRoll.doRoll(actor, true);
}

function adjustFormulaByWeapon (actor, formula, weapon) {
    let weaponData = weapon.system;

    // update weapon formula with custom modifiers
    if (weaponData.customPoolModifier) {
        formula.pool += weaponData.customPoolModifier;
    }
    if (weaponData.customBonusDiceModifier) {
        formula.bonusDice += weaponData.customBonusDiceModifier;
    }
    if (weaponData.customTestModifier) {
        formula.modifier += weaponData.customTestModifier;
    }

    if (!weaponData.training)
        return formula;
    let poolModifier = formula.bonusDice - weaponData.training;

    if (poolModifier <= 0) {
        formula.pool += poolModifier;
        formula.bonusDice = 0;
    } else {
        formula.bonusDice = poolModifier;
    }

    return formula;
}

ChronicleSystem.adjustFormulaByWeapon = adjustFormulaByWeapon;
ChronicleSystem.eventHandleRoll = eventHandleRoll;
ChronicleSystem.handleRoll = handleRoll;
ChronicleSystem.handleRollAsync = handleRollAsync;
ChronicleSystem.getActorAbilityFormula = getAbilityTestFormula;

ChronicleSystem.dispositions = CHARACTER_DISPOSITIONS;
ChronicleSystem.unitStatuses = UNIT_STATUSES;
ChronicleSystem.unitFacings = UNIT_FACINGS;
ChronicleSystem.formations = UNIT_FORMATIONS;

ChronicleSystem.equippedConstants = EQUIPPED_CONSTANTS;
ChronicleSystem.defaultMovement = DEFAULT_MOVEMENT;
ChronicleSystem.modifiersConstants = CHARACTER_ATTR_CONSTANTS;
ChronicleSystem.keyConstants = KEY_CONSTANTS;

ChronicleSystem.lawModifiers = [
    {min: 0, mod: -20},
    {min: 1, mod: -10},
    {min: 11, mod: -5},
    {min: 21, mod: -2},
    {min: 31, mod: -1},
    {min: 41, mod: 0},
    {min: 51, mod: 1},
    {min: 61, mod: 2},
    {min: 71, mod: 5}
]

ChronicleSystem.populationModifiers = [
    {min: 0, mod: -10},
    {min: 1, mod: -5},
    {min: 11, mod: 0},
    {min: 21, mod: 1},
    {min: 31, mod: 3},
    {min: 41, mod: 1},
    {min: 51, mod: 0},
    {min: 61, mod: -5},
    {min: 71, mod: -10}
]
