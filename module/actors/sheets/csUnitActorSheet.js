/**
 * A Warfare Unit actor sheet.
 *
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CSActorSheet}
 */
import { ChronicleSystem } from "../../system/ChronicleSystem.js";
import {CSActorSheet} from "./csActorSheet.js";
import LOGGER from "../../utils/logger.js";


export class CSUnitActorSheet extends CSActorSheet {
    itemTypesPermitted = [
        "ability",
        "armor",
        "hero",
        "equipment",
        "weapon"
    ]

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["chroniclesystem", "unit", "sheet", "actor"],
            template: "systems/chroniclesystem/templates/actors/units/unit-sheet.hbs",
            width: 700,
            height: 900,
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: "abilities"
                }
            ],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        this.splitItemsByType(data);

        let character = data.actor.getCSData();
        this.isOwner = this.actor.isOwner;

        character.owned.equipments = this._checkNull(data.itemsByType['equipment']);
        character.owned.weapons = this._checkNull(data.itemsByType['weapon']);
        character.owned.armors = this._checkNull(data.itemsByType['armor']);
        character.owned.abilities = this._checkNull(data.itemsByType['ability']).sort((a, b) => a.name.localeCompare(b.name));
        character.owned.heroes = this._checkNull(data.itemsByType['hero']).sort((a, b) => a.name.localeCompare(b.name));

        data.statuses = ChronicleSystem.unitStatuses;

        data.notEquipped = ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED;

        character.owned.weapons.forEach((weapon) => {
            let weaponData = weapon.system;
            let info = weaponData.specialty.split(':');
            if (info.length < 2)
                return "";
            let formula = ChronicleSystem.getActorAbilityFormula(data.actor, info[0], info[1]);
            formula = ChronicleSystem.adjustFormulaByWeapon(data.actor, formula, weapon);
            let matches = weaponData.damage.match('@([a-zA-Z]*)([-\+\/\*]*)([0-9]*)');
            if (matches) {
                if (matches.length === 4) {
                    let ability = data.actor.getAbilityValue(matches[1]);
                    weapon.damageValue = eval(`${ability}${matches[2]}${matches[3]}`);
                }
            }
            weapon.formula = formula;
        });

        data.character = character;
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.item .item-name').on('click', (ev) => {
            $(ev.currentTarget).parents('.item').find('.description').slideToggle();
        });

        html.find('.disposition.option').click(this._onUnitStatusChanged.bind(this));

        html.find('.equipped').click(this._onEquippedStateChanged.bind(this));

        html.find(".square").on("click", this._onClickSquare.bind(this));

        html.find(".owned-item-control").on("click", this._onClickOwnedItemControl.bind(this));
    }

    async _onClickOwnedItemControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const itemIndex = parseInt(a.dataset.index);
        const list = a.dataset.list;
        const action = a.dataset.action;
        const itemId = this.actor.system.owned[list][itemIndex]._id

        if ( action === "delete" ) {
            this.actor.deleteEmbeddedDocuments("Item", [itemId,])
        }
    }

    async setDisorganisationValue(newValue) {
        let value = Math.max(Math.min(parseInt(newValue), this.actor.getCSData().disorganisation.total), 0);
        let mod = Math.max(Math.min(parseInt(newValue), this.actor.getCSData().disorganisation.modifier), 0);

        this.actor.updateTempPenalties();

        if (value > 0) {
            this.actor.addPenalty(ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.DISORGANISATION, value, false);
            // TODO: find a better way to do this (using the modifier/penalty system)
            mod += value*3;
        } else {
            this.actor.removePenalty(ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.DISORGANISATION);
        }

        this.actor.update({
            "system.disorganisation.current": value,
            "system.discipline.disorganisationModifier": mod,
            "system.penalties": this.actor.penalties
        });
    }

    async setOrdersReceivedValue(newValue) {
        let value = Math.max(Math.min(parseInt(newValue), this.actor.getCSData().ordersReceived.total), 0);
        let mod = Math.max(Math.min(parseInt(newValue), this.actor.getCSData().ordersReceived.modifier), 0);

        this.actor.updateTempPenalties();

        if (value > 0) {
            // TODO: find a better way to do this (using the modifier/penalty system)
            mod += value*3;
        }

        this.actor.update({
            "system.ordersReceived.current": value,
            "system.discipline.ordersReceivedModifier": mod,
        });
    }

    async _onClickSquare(ev) {
        ev.preventDefault();
        let method = `set${ev.currentTarget.dataset.type}Value`;
        await this[method](ev.currentTarget.id);
    }

    async _onEquippedStateChanged(event) {
        event.preventDefault();
        const eventData = event.currentTarget.dataset;
        let documment = this.actor.getEmbeddedDocument('Item', eventData.itemId);
        let collection = [];
        let tempCollection = [];

        let isArmor = parseInt(eventData.hand) === ChronicleSystem.equippedConstants.WEARING;
        let isCommander = parseInt(eventData.hand) === ChronicleSystem.equippedConstants.COMMANDER;
        let isUnequipping = parseInt(eventData.hand) === 0;

        if (isUnequipping) {
            documment.getCSData().equipped = 0;
        } else {
            if (isCommander) {
                documment.getCSData().equipped = ChronicleSystem.equippedConstants.COMMANDER;
                tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === ChronicleSystem.equippedConstants.COMMANDER);
                this.actor.getCSData().commander = tempCollection[0]
            }
            else if (isArmor) {
                documment.getCSData().equipped = ChronicleSystem.equippedConstants.WEARING;
                tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === ChronicleSystem.equippedConstants.WEARING);
            } else {
                let twoHandedQuality = Object.values(documment.getCSData().qualities).filter((quality) => quality.name.toLowerCase() === "two-handed");
                if (twoHandedQuality.length > 0) {
                    tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === ChronicleSystem.equippedConstants.MAIN_HAND || item.getCSData().equipped === ChronicleSystem.equippedConstants.OFFHAND || item.getCSData().equipped === ChronicleSystem.equippedConstants.BOTH_HANDS);
                    documment.getCSData().equipped = ChronicleSystem.equippedConstants.BOTH_HANDS;
                } else {
                    tempCollection = this.actor.getEmbeddedCollection('Item').filter((item) => item.getCSData().equipped === parseInt(eventData.hand) || item.getCSData().equipped === ChronicleSystem.equippedConstants.BOTH_HANDS);
                    documment.getCSData().equipped = parseInt(eventData.hand);
                }
            }
        }

        this.actor.updateTempModifiers();

        tempCollection.forEach((item) => {
            collection.push({_id: item._id, "data.equipped": ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED});
            item.onEquippedChanged(this.actor, false);
        });

        collection.push({_id: documment._id, "data.equipped": documment.getCSData().equipped});
        documment.onEquippedChanged(this.actor, documment.getCSData().equipped > 0);

        this.actor.saveModifiers();

        this.actor.updateEmbeddedDocuments('Item', collection);
    }

    async _onUnitStatusChanged(event, targets) {
        event.preventDefault();
        let rating = parseInt(event.target.dataset.id);
        if (!ChronicleSystem.unitStatuses.find((status) => status.rating === rating)) {
            LOGGER.warn("the informed unit status does not exist.");
            return;
        }
        this.actor.update({"system.currentStatus": rating});
    }

    /* -------------------------------------------- */

    async _onDrop(event) {
        event.preventDefault();
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));

        }
        catch (err) {
            return;
        }
        return super._onDrop(event);
    }

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
                img: targetActor.img
            }
            this.actor.createEmbeddedDocuments("Item", [heroDataObject])
                .then(function (result) {
                    embeddedItem.concat(result);
                });
        }
    }

    isItemPermitted(type) {
        return this.itemTypesPermitted.includes(type);
    }
}