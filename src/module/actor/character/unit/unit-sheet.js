import { CharacterSheetBase } from "../character-sheet-base.js";
import { ChronicleSystem } from "../../../system/ChronicleSystem.js";
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
        "weapon",
        "effect"
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
        data.dtypes = ["String", "Number", "Boolean"];
        this.splitItemsByType(data);

        let character = data.actor.getData();
        this.isOwner = this.actor.isOwner;

        character.owned.equipments = this._checkNull(data.itemsByType['equipment']);
        character.owned.weapons = this._checkNull(data.itemsByType['weapon']);
        character.owned.armors = this._checkNull(data.itemsByType['armor']);
        character.owned.abilities = this._checkNull(data.itemsByType['ability']).sort((a, b) => a.name.localeCompare(b.name));
        character.owned.heroes = this._checkNull(data.itemsByType['hero']).sort((a, b) => a.name.localeCompare(b.name));

        data.statuses = UNIT_STATUSES;
        data.facings = UNIT_FACINGS;
        data.formations = UNIT_FORMATIONS;

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
        // refresh embedded heroes
        character.owned.heroes.forEach((hero) => {
            refreshEmbeddedActorData(hero);
        })

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
        html.find('.item .toggle-active').click(this._onItemToggleActive.bind(this));

        html.find('.status.option').click(this._onUnitStatusChanged.bind(this));
        html.find('.facing.option').click(this._onUnitFacingChanged.bind(this));
        html.find('.formation.option').click(this._onUnitFormationChanged.bind(this));

        html.find('.equipped').click(this._onEquippedStateChanged.bind(this));

        html.find(".square").on("click", this._onClickSquare.bind(this));

        html.find(".owned-item-control").on("click", this._onClickOwnedItemControl.bind(this));

        html.find(".effect-clear").on("click", this._onClickEffectClear.bind(this));
        html.find(".effect-clear-all").on("click", this._onClickEffectClearAll.bind(this));
    }

    async setDisorganisationValue(newValue) {
        updateDisorganisation(this.actor, newValue);
    }

    async setOrdersReceivedValue(newValue) {
        updateOrdersReceived(this.actor, newValue);
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