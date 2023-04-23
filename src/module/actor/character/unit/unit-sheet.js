import LOGGER from "../../../../util/logger.js";
import { CharacterSheetBase } from "../character-sheet-base.js";
import { ChronicleSystem } from "../../../system/ChronicleSystem.js";
import { getAttachedHeroes, updateAttachedHeroesEffects } from "./helpers.js";

/**
 * The ActorSheet entity for handling warfare units.
 *
 * @category ActorSheet
 */
export class UnitSheet extends CharacterSheetBase {
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
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        this.splitItemsByType(data);

        let character = data.actor.getData();
        this.isOwner = this.actor.isOwner;

        character.owned.equipments = this._checkNull(data.itemsByType['equipment']);
        character.owned.weapons = this._checkNull(data.itemsByType['weapon']);
        character.owned.armors = this._checkNull(data.itemsByType['armor']);
        character.owned.abilities = this._checkNull(data.itemsByType['ability']).sort((a, b) => a.name.localeCompare(b.name));
        character.owned.heroes = this._checkNull(data.itemsByType['hero']).sort((a, b) => a.name.localeCompare(b.name));

        data.statuses = ChronicleSystem.unitStatuses;
        data.facings = ChronicleSystem.unitFacings;
        data.formations = ChronicleSystem.formations;

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
        updateAttachedHeroesEffects(this.actor)

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

        html.find('.status.option').click(this._onUnitStatusChanged.bind(this));
        html.find('.facing.option').click(this._onUnitFacingChanged.bind(this));
        html.find('.formation.option').click(this._onUnitFormationChanged.bind(this));

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
        let value = Math.max(Math.min(parseInt(newValue), this.actor.getData().disorganisation.total), 0);
        let mod = Math.max(Math.min(parseInt(newValue), this.actor.getData().disorganisation.modifier), 0);

        this.actor.updateTempTransformers();

        if (value > 0) {
            this.actor.addTransformer("penalties", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.DISORGANISATION, value, false);
            this.actor.addTransformer("modifiers", ChronicleSystem.modifiersConstants.DISCIPLINE, ChronicleSystem.keyConstants.DISORGANISATION, value*3, false)
        } else {
            this.actor.removeTransformer("penalties", ChronicleSystem.modifiersConstants.ALL, ChronicleSystem.keyConstants.DISORGANISATION);
            this.actor.removeTransformer("modifiers", ChronicleSystem.modifiersConstants.DISCIPLINE, ChronicleSystem.keyConstants.DISORGANISATION)
        }

        this.actor.update({
            "system.disorganisation.current": value,
            "system.penalties": this.actor.penalties,
            "system.modifiers": this.actor.modifiers
        });
    }

    async setOrdersReceivedValue(newValue) {
        let value = Math.max(Math.min(parseInt(newValue), this.actor.getData().ordersReceived.total), 0);
        let mod = Math.max(Math.min(parseInt(newValue), this.actor.getData().ordersReceived.modifier), 0);

        if (value > 0) { mod += value*3 }

        this.actor.update({
            "system.ordersReceived.current": value,
            "system.discipline.ordersReceivedModifier": mod,
        });
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
                let items = this.actor.getEmbeddedCollection('Item')
                tempCollection = items.filter((item) => item.getCSData().equipped === ChronicleSystem.equippedConstants.COMMANDER);
                this.actor.getData().commander = tempCollection[0];
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

        this.actor.updateTempTransformers();
        updateAttachedHeroesEffects(this.actor)

        tempCollection.forEach((item) => {
            collection.push({_id: item._id, "data.equipped": ChronicleSystem.equippedConstants.IS_NOT_EQUIPPED});
            item.onEquippedChanged(this.actor, false);
        });

        collection.push({_id: documment._id, "data.equipped": documment.getCSData().equipped});
        documment.onEquippedChanged(this.actor, documment.getCSData().equipped > 0);

        this.actor.saveTransformers();

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

    async _onUnitFacingChanged(event, targets) {
        event.preventDefault();
        let rating = parseInt(event.target.dataset.id);
        const facing = ChronicleSystem.unitFacings.find((item) => item.rating === rating);
        if (!facing) {
            LOGGER.warn(`the informed unit facing ${rating} does not exist.`);
            return;
        }

        this.actor.updateTempTransformers();

        // test dice modifier (only fighting)
        // override the penalty workflow to get test dice modifiers to work (by getting opposite value)
        // TODO: change getPenalty() to be getTestDiceMod() and add support for getBonusDiceMod()?
        if (facing.testDiceModifier !== 0) {
            let penalty = -(facing.testDiceModifier)
            this.actor.addTransformer("penalties",
                ChronicleSystem.modifiersConstants.FIGHTING, ChronicleSystem.keyConstants.FACING,
                penalty, false
            );
        } else {
            this.actor.removeTransformer("penalties",
                ChronicleSystem.modifiersConstants.FIGHTING, ChronicleSystem.keyConstants.FACING
            );
        }
        // bonus dice modifier (only fighting)
        if (facing.bonusDiceModifier > 0) {
            this.actor.addTransformer("bonuses",
                ChronicleSystem.modifiersConstants.FIGHTING, ChronicleSystem.keyConstants.FACING,
                facing.bonusDiceModifier, false
            );
        } else {
            this.actor.removeTransformer("bonuses",
                ChronicleSystem.modifiersConstants.FIGHTING, ChronicleSystem.keyConstants.FACING
            );
        }

        this.actor.update({
            "system.currentFacing": rating,
            "system.penalties": this.actor.penalties,
            "system.bonuses": this.actor.bonuses
        });
    }

    async _onUnitFormationChanged(event, targets) {
        event.preventDefault();
        let rating = parseInt(event.target.dataset.id);
        const formation = ChronicleSystem.formations.find((item) => item.rating === rating);
        if (!formation) {
            LOGGER.warn(`the informed unit formation ${rating} does not exist.`);
            return;
        }

        this.actor.updateTempTransformers();

        // TODO: see _onUnitFacingChanged()
        // TODO: consolidate these with a loop, grabbing fields from Formation() object
        // update modifiers/penalties/bonuses
        // discipline
        if (formation.disciplineModifier !== 0) {
            this.actor.addTransformer("modifiers",
                ChronicleSystem.modifiersConstants.DISCIPLINE, ChronicleSystem.keyConstants.FORMATION,
                formation.disciplineModifier, false
            );
        } else {
            this.actor.removeTransformer("modifiers",
                ChronicleSystem.modifiersConstants.DISCIPLINE, ChronicleSystem.keyConstants.FORMATION
            );
        }
        // fighting defense
        if (formation.fightingDefenseModifier !== 0) {
            this.actor.addTransformer("modifiers",
                ChronicleSystem.modifiersConstants.COMBAT_DEFENSE_FIGHTING,
                ChronicleSystem.keyConstants.FORMATION,
                formation.fightingDefenseModifier, false
            );
        } else {
            this.actor.removeTransformer("modifiers",
                ChronicleSystem.modifiersConstants.COMBAT_DEFENSE_FIGHTING,
                ChronicleSystem.keyConstants.FORMATION
            );
        }
        // marksmanship defense
        if (formation.marksmanshipDefenseModifier !== 0) {
            this.actor.addTransformer("modifiers",
                ChronicleSystem.modifiersConstants.COMBAT_DEFENSE_MARKSMANSHIP,
                ChronicleSystem.keyConstants.FORMATION,
                formation.marksmanshipDefenseModifier, false
            );
        } else {
            this.actor.removeTransformer("modifiers",
                ChronicleSystem.modifiersConstants.COMBAT_DEFENSE_MARKSMANSHIP,
                ChronicleSystem.keyConstants.FORMATION
            );
        }
        // movement
        if (formation.movementModifier !== 0) {
            this.actor.addTransformer("modifiers",
                ChronicleSystem.modifiersConstants.MOVEMENT,
                ChronicleSystem.keyConstants.FORMATION,
                formation.movementModifier, false
            );
        } else {
            this.actor.removeTransformer("modifiers",
                ChronicleSystem.modifiersConstants.MOVEMENT,
                ChronicleSystem.keyConstants.FORMATION
            );
        }
        // fighting
        if (formation.testDiceModifier !== 0) {
            let penalty = -(formation.testDiceModifier)
            this.actor.addTransformer("penalties",
                ChronicleSystem.modifiersConstants.FIGHTING, ChronicleSystem.keyConstants.FORMATION,
                penalty, false
            );
        } else {
            this.actor.removeTransformer("penalties",
                ChronicleSystem.modifiersConstants.FIGHTING, ChronicleSystem.keyConstants.FORMATION
            );
        }

        // save
        this.actor.update({
            "system.currentFormation": rating,
            "system.modifiers": this.actor.modifiers,
            "system.penalties": this.actor.penalties
        });
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
                system: {targetId: targetId}
            }
            this.actor.createEmbeddedDocuments("Item", [heroDataObject])
                .then(function (result) {
                    embeddedItem.concat(result);
                });
            updateAttachedHeroesEffects(this.actor)
        }
    }
}