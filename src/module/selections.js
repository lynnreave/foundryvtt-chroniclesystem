import { Disposition } from "./type/disposition.js";
import { UnitStatus } from "./type/unit-status.js";
import { UnitFacing } from "./type/unit-facing.js";
import { Formation } from "./type/formation.js";

/**
 * Available character Actor dispositions.
 * @type {Array}
 */
export const CHARACTER_DISPOSITIONS = [
    new Disposition("CS.sheets.character.dispositions.affectionate", 1, -2, 5),
    new Disposition("CS.sheets.character.dispositions.friendly", 2, -1, 3),
    new Disposition("CS.sheets.character.dispositions.amiable", 3, 0, 1),
    new Disposition("CS.sheets.character.dispositions.indifferent", 4, 0, 0),
    new Disposition("CS.sheets.character.dispositions.dislike", 5, 1, -2),
    new Disposition("CS.sheets.character.dispositions.unfriendly", 6, 2, -4),
    new Disposition("CS.sheets.character.dispositions.malicious", 7, 3, -6),
];

/**
 * Available combat action types.
 * @type {Array}
 */
export const COMBAT_ACTION_TYPES = [
    {name: "CS.constants.combatActionTypes.free"},
    {name: "CS.constants.combatActionTypes.lesser"},
    {name: "CS.constants.combatActionTypes.greater"},
    {name: "CS.constants.combatActionTypes.varies"},
    {name: "CS.constants.combatActionTypes.triggered"}
]

/**
 * Critical results based on number of d6s rolled for a test.
 * @type {Array}
 */
export const CRITICAL_RESULTS = [
    {name: "CS.constants.criticalResults.solidHit", desc: "CS.constants.criticalResults.solidHitDesc"},
    {name: "CS.constants.criticalResults.powerfulHit", desc: "CS.constants.criticalResults.powerfulHitDesc"},
    {name: "CS.constants.criticalResults.bloodyWound", desc: "CS.constants.criticalResults.bloodyWoundDesc"},
    {name: "CS.constants.criticalResults.cripplingWound", desc: "CS.constants.criticalResults.cripplingWoundDesc"},
    {name: "CS.constants.criticalResults.killingBlow", desc: "CS.constants.criticalResults.killingBlowDesc"},
    {name: "CS.constants.criticalResults.terribleBlow", desc: "CS.constants.criticalResults.terribleBlowDesc"},
    {name: "CS.constants.criticalResults.impressiveDeath", desc: "CS.constants.criticalResults.impressiveDeathDesc"},
    {name: "CS.constants.criticalResults.horribleDeath", desc: "CS.constants.criticalResults.horribleDeathDesc"}
]

/**
 * Targets for transformers.
 * @type {Array}
 */
export const EFFECT_TARGETS = [
    {name: "CS.constants.abilities.all", target: "all"},
    {name: "CS.constants.abilities.bulk", target: "bulk"},
    {name: "CS.constants.abilities.combat_defense", target: "combat_defense"},
    {name: "CS.constants.abilities.combat_defense_fighting", target: "combat_defense_fighting"},
    {name: "CS.constants.abilities.combat_defense_marksmanship", target: "combat_defense_marksmanship"},
    {name: "CS.constants.abilities.composure_resistance", target: "composure_resistance"},
    {name: "CS.constants.abilities.damage_resistance", target: "damage_resistance"},
    {name: "CS.constants.abilities.discipline", target: "discipline"},
    {name: "CS.constants.abilities.movement", target: "movement"}
]

/**
 * Fumble results based on number of d6s rolled for a test.
 * @type {Array}
 */
export const FUMBLE_RESULTS = [
    {name: "CS.constants.fumbleResults.injureSelf", desc: "CS.constants.fumbleResults.injureSelfDesc"},
    {name: "CS.constants.fumbleResults.strikeAlly", desc: "CS.constants.fumbleResults.strikeAllyDesc"},
    {name: "CS.constants.fumbleResults.drop", desc: "CS.constants.fumbleResults.dropDesc"},
    {name: "CS.constants.fumbleResults.minorBreak", desc: "CS.constants.fumbleResults.minorBreakDesc"},
    {name: "CS.constants.fumbleResults.majorBreak", desc: "CS.constants.fumbleResults.majorBreakDesc"},
    {name: "CS.constants.fumbleResults.slipperyGrip", desc: "CS.constants.fumbleResults.slipperyGripDesc"},
    {name: "CS.constants.fumbleResults.bloodInTheEyes", desc: "CS.constants.fumbleResults.bloodInTheEyesDesc"},
    {name: "CS.constants.fumbleResults.overbalanced", desc: "CS.constants.fumbleResults.overbalancedDesc"}
]

/**
 * Available unit Actor statuses.
 * @type {Array}
 */
export const UNIT_STATUSES = [
    new UnitStatus("CS.sheets.unit.statuses.organised"),
    new UnitStatus("CS.sheets.unit.statuses.disorganised"),
    new UnitStatus("CS.sheets.unit.statuses.routed"),
    new UnitStatus("CS.sheets.unit.statuses.destroyed")
]

/**
 * Available unit Actor facings.
 * @type {Array}
 */
export const UNIT_FACINGS = [
    new UnitFacing("CS.sheets.unit.facings.none",  0, 0),
    new UnitFacing("CS.sheets.unit.facings.front",  0, 0),
    new UnitFacing("CS.sheets.unit.facings.flank",  0, 1),
    new UnitFacing("CS.sheets.unit.facings.rear", 1, 0),
    new UnitFacing("CS.sheets.unit.facings.surroundedFront", 0, 1),
    new UnitFacing("CS.sheets.unit.facings.surroundedFlank",  1, 0),
    new UnitFacing("CS.sheets.unit.facings.surroundedRear", 2, 0),
    new UnitFacing("CS.sheets.unit.facings.flanking", -1, 0),
];

/**
 * Available unit Actor formations.
 * @type {Array}
 */
export const UNIT_FORMATIONS = [
    new Formation(
        "CS.sheets.unit.formations.none",
        0, 0,
        0, 0, 0, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.battle",
        0, 0,
        0, 0, -1, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.checkered",
        0, 3,
        0, 5, -1, 0,
        [
            "+1D on Fighting tests against mobs"
        ]
    ),
    new Formation(
        "CS.sheets.unit.formations.column",
        0, 0,
        0, 0, 0, -1,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.mob",
        -3, 6,
        -5, -5, 0, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.phalanx",
        9, 0,
        5, -5, -2, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.shieldWall",
        6, 0,
        5, 0, -99, 0,
        [
            "Negates benefits of enemy Charge action",
            "+5 Defense from cover to any unit directly behind this one"
        ]
    ),
    new Formation(
        "CS.sheets.unit.formations.square",
        6, 0,
        0, 0, -99, 0,
        [
            "Negates benefits of enemy attacks to the flank and rear of this unit"
        ]
    ),
    new Formation(
        "CS.sheets.unit.formations.tortoise",
        9, 0,
        5, 5, -2, -99,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.wedge",
        3, 0,
        0, -5, 0, 0,
        [
            "+1D on Fighting tests to conduct or withstand a Charge"
        ]
    ),
];