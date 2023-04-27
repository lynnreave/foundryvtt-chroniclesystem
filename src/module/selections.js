import { Disposition } from "./type/disposition.js";
import { UnitStatus } from "./type/unitStatus.js";
import { UnitFacing } from "./type/unitFacing.js";
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
 * Available unit Actor statuses.
 * @type {Array}
 */
export const UNIT_STATUSES = [
    new UnitStatus("CS.sheets.unit.statuses.organised", 1),
    new UnitStatus("CS.sheets.unit.statuses.disorganised", 2),
    new UnitStatus("CS.sheets.unit.statuses.routed", 3),
    new UnitStatus("CS.sheets.unit.statuses.destroyed", 4)
]

/**
 * Available unit Actor facings.
 * @type {Array}
 */
export const UNIT_FACINGS = [
    new UnitFacing("CS.sheets.unit.facings.none", 0, 0, 0),
    new UnitFacing("CS.sheets.unit.facings.front", 1, 0, 0),
    new UnitFacing("CS.sheets.unit.facings.flank", 2, 0, 1),
    new UnitFacing("CS.sheets.unit.facings.rear", 3, 1, 0),
    new UnitFacing("CS.sheets.unit.facings.surroundedFront", 4, 0, 1),
    new UnitFacing("CS.sheets.unit.facings.surroundedFlank", 5, 1, 0),
    new UnitFacing("CS.sheets.unit.facings.surroundedRear", 6, 2, 0),
    new UnitFacing("CS.sheets.unit.facings.flanking", 7, -1, 0),
];

/**
 * Available unit Actor formations.
 * @type {Array}
 */
export const UNIT_FORMATIONS = [
    new Formation(
        "CS.sheets.unit.formations.none", 0,
        0, 0,
        0, 0, 0, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.battle", 1,
        0, 0,
        0, 0, -1, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.checkered", 2,
        0, 3,
        0, 5, -1, 0,
        [
            "+1D on Fighting tests against mobs"
        ]
    ),
    new Formation(
        "CS.sheets.unit.formations.column", 3,
        0, 0,
        0, 0, 0, -1,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.mob", 4,
        -3, 6,
        -5, -5, 0, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.phalanx", 5,
        9, 0,
        5, -5, -2, 0,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.shieldWall", 6,
        6, 0,
        5, 0, -99, 0,
        [
            "Negates benefits of enemy Charge action",
            "+5 Defense from cover to any unit directly behind this one"
        ]
    ),
    new Formation(
        "CS.sheets.unit.formations.square", 7,
        6, 0,
        0, 0, -99, 0,
        [
            "Negates benefits of enemy attacks to the flank and rear of this unit"
        ]
    ),
    new Formation(
        "CS.sheets.unit.formations.tortoise", 8,
        9, 0,
        5, 5, -2, -99,
        []
    ),
    new Formation(
        "CS.sheets.unit.formations.wedge", 9,
        3, 0,
        0, -5, 0, 0,
        [
            "+1D on Fighting tests to conduct or withstand a Charge"
        ]
    ),
];