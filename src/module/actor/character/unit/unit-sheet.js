import { CharacterSheetBase } from "../character-sheet-base.js";
import {
    updateAttachedHeroesEffects,
    updateDisorganisation,
    updateFacing,
    updateFormation,
    updateOrdersReceived,
    updateStatus
} from "./helpers.js";
import {
    UNIT_FACINGS,
    UNIT_FORMATIONS,
    UNIT_STATUSES
} from "../../../selections.js";
import { refreshEmbeddedActorData } from "../helpers.js";
import { getData } from "../../../common.js";

/**
 * The ActorSheet entity for handling warfare units.
 *
 * @category ActorSheet
 */
export class UnitSheet extends CharacterSheetBase {
    itemTypesPermitted = [
        "ability",
        "actionCombat",
        "armor",
        "effect",
        "equipment",
        "hero",
        "order",
        "weapon"
    ]

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["chroniclesystem", "unit", "sheet", "actor"],
            template: "systems/chroniclesystem/templates/actors/characters/unit-sheet.hbs",
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: "warfare"
                }
            ],
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        let unit = data.character;

        // sort
        unit.owned.heroes = this._checkNull(data.itemsByType['hero']).sort((a, b) => a.name.localeCompare(b.name));

        // orders categorize & sort
        unit.owned.orders = this._checkNull(data.itemsByType['order']).sort((a, b) => getData(a).difficulty - getData(b).difficulty || a.name.localeCompare(b.name));
        const half = Math.ceil(unit.owned.orders.length / 2);
        unit.owned.ordersOne = unit.owned.orders.slice(0, half);
        unit.owned.ordersTwo = unit.owned.orders.slice(half);

        // selections & data
        data.statuses = UNIT_STATUSES;
        data.facings = UNIT_FACINGS;
        data.formations = UNIT_FORMATIONS;

        // update embedded actors data
        updateAttachedHeroesEffects(this.actor);
        unit.owned.heroes.forEach((hero) => {
            refreshEmbeddedActorData(hero);
        })

        // minimum 1 movement/4 sprint
        data.character.movement.total = Math.max(data.character.movement.total, 1);
        data.character.movement.sprintTotal = Math.max(data.character.movement.sprintTotal, 4);

        // return
        data.character = unit;
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.status.option').click(this._onUnitStatusChanged.bind(this));
        html.find('.facing.option').click(this._onUnitFacingChanged.bind(this));
        html.find('.formation.option').click(this._onUnitFormationChanged.bind(this));
    }

    async setDisorganisationValue(newValue) {
        updateDisorganisation(this.actor, newValue);
    }

    async setOrdersReceivedValue(newValue) {
        updateOrdersReceived(this.actor, newValue);
    }

    async _onUnitStatusChanged(event, targets) {
        event.preventDefault();
        updateStatus(this.actor, event.target.dataset.id);
    }

    async _onUnitFacingChanged(event, targets) {
        event.preventDefault();
        updateFacing(this.actor, event.target.dataset.id);
    }

    async _onUnitFormationChanged(event, targets) {
        event.preventDefault();
        updateFormation(this.actor, event.target.dataset.id);
    }

    /* -------------------------------------------- */

    async _onDropActor(event, data) {
        console.log("On Drop Actor | CSUnitSheet | csUnitSheet.js");

        // drop actor to attach hero
        let embeddedItem = [];
        let sourceId = this.actor._id;
        let sourceActor = this.actor;
        let targetId = data.uuid.replace('Actor.', '');
        let targetActor = game.actors.get(targetId);
        let isRelationshipPermitted = true;

        // determine if hero can be attached
        const existingHero = sourceActor.items.find((i) => {
            return i.name === targetActor.name;
        });
        if (!this.isItemPermitted("hero")) {
            console.log("Heroes are not permitted for this actor type.");
        } else if (existingHero) {
            console.log(`${sourceActor.name} already has attached hero ${targetActor.name}.`);
            isRelationshipPermitted = false;
        } else {
            console.log(`${sourceActor.name} does not yet have attached hero ${targetActor.name}.`);
        }

        // attach hero
        if (isRelationshipPermitted) {
            console.log(`Attaching hero ${targetActor.name} to ${sourceActor.name}`);
            let heroDataObject = {
                id: targetId,
                type: "hero",
                name: targetActor.name,
                img: targetActor.img,
                system: {equipped: 0, targetId: targetId}
            }
            this.actor.createEmbeddedDocuments("Item", [heroDataObject])
                .then(function (result) {
                    embeddedItem.concat(result);
                });
            updateAttachedHeroesEffects(this.actor)
        }
    }
}