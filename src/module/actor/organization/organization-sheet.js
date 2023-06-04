import { ActorSheetChronicle } from "../actor-sheet-chronicle.js";
import { getData } from "../../common.js";
import LOGGER from "../../../util/logger.js";
import { getAbilityValue } from "../character/abilities.js";
import { EQUIPPED_CONSTANTS, KEY_CONSTANTS } from "../../constants.js";
import { getAbilityTestFormula } from "../../roll/rolls.js";
import SystemUtils from "../../../util/systemUtils.js";
import { CSConstants } from "../../system/csConstants.js";

/**
 * An ActorSheet entity for handling organizations.
 *
 * @category Actor
 */
export class OrganizationSheet extends ActorSheetChronicle {
    actorTypesPermitted = [
        "character",
        "land",
        "organization",
        "unit"
    ];
    itemTypesPermitted = [
        "building",
        "position",
        "terrain",
        "terrainFeature"
    ];

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["chroniclesystem", "sheet", "organization", "actor"],
            template: "systems/chroniclesystem/templates/actors/organizations/organization-sheet.hbs",
            width: 800,
            height: 800,
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: "dashboard"
                }
            ],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    getData(options) {
        let data =  super.getData(options);
        let resources = ["defense", "influence", "lands", "law", "population", "power", "wealth"];

        // split items by type
        this.splitItemsByType(data);

        // get org data
        let org = getData(data.actor);

        // build & sort positions data
        org.owned.positions = this._checkNull(data.itemsByType['position']).sort(function(a, b) {
            let aDat = getData(a);
            let bDat = getData(b);
            return bDat.isImportant - aDat.isImportant || bDat.weight - aDat.weight || a.name.localeCompare(b.name);
        });
        org.leaderPosition = null;
        org.stewardPosition = null;
        org.owned.positions.forEach((position) => {
            let positionData = getData(position);

            // get coded roles
            if (positionData.equipped === EQUIPPED_CONSTANTS.LEADER_POSITION) { org.leaderPosition = position; }
            if (positionData.equipped === EQUIPPED_CONSTANTS.STEWARD_POSITION) { org.stewardPosition = position; }
        });

        // build & sort owned characters (associates)
        org.leaders = [];
        org.leaderNames = [];
        org.stewards = [];
        org.stewardNames = [];
        org.importantRoles = [];
        org.owned.characters.forEach((character) => {
            // update pointer data
            // get the target actor
            let targetActor = game.actors.get(character.id);
            // update actor item
            if (targetActor) {
                character.name = targetActor.name;
                character.img = targetActor.img;
                character.age = getData(targetActor).age;
                character.status = getAbilityValue(targetActor, "status");
            }
            // if (!character.position) { character.position = ""; }

            // get coded role holders
            if (org.leaderPosition && character.position && character.position === org.leaderPosition._id) {
                org.leaders.push(character);
                org.leaderNames.push(character.name)
            }
            if (org.stewardPosition && character.position && character.position === org.stewardPosition._id) {
                org.stewards.push(character);
                org.stewardNames.push(character.name)
            }

            // get important position holders
            if (character.position) {
                // get position from owned positions
                let position = org.owned.positions.find((position) => {
                    return position._id === character.position
                });
                if (position) {
                    let positionData = getData(position);
                    if (positionData.isImportant) {
                        character.positionObj = position;
                        org.importantRoles.push(character);
                    }
                }
            }
        });
        org.owned.characters = org.owned.characters.sort(function(a, b) {
            return b.status - a.status || a.name.localeCompare(b.name);
        });
        org.importantRoles = org.importantRoles.sort(function(a, b) {
            let aPosDat = getData(a.positionObj);
            let bPosDat = getData(b.positionObj);
            return bPosDat.weight - aPosDat.weight || a.name.localeCompare(b.name);
        });

        // refresh owned land holdings actor data
        org.defense.derivedInvestment = 0;
        org.lands.derivedInvestment = 0;
        org.power.derivedInvestment = 0;
        org.wealth.derivedInvestment = 0;
        org.population.derivedInvestment = 0;
        org.defenseBonus = 0;
        org.fortunePoolModifier = 0;
        org.fortuneModifier = 0;
        org.investmentLand = 0;
        org.benefits = [];
        org.owned.lands.forEach((land) => {
            const targetActor = game.actors.get(land.id);
            const actorSheetData = targetActor.sheet.getData();
            // update actor item
            if (targetActor) {
                land.name = targetActor.name;
                land.img = targetActor.img;
                land.terrain = getData(targetActor).owned.terrain;
                // TODO: are these even necessary? given the below updates
                land.summarizedData = {
                    benefits: actorSheetData.character.benefits,
                    defenseBonus: actorSheetData.character.defenseBonus,
                    fortunePoolModifier: actorSheetData.character.fortunePoolModifier,
                    fortuneModifier: actorSheetData.character.fortuneModifier,
                    investmentLand: actorSheetData.character.investmentLand,
                    investmentWealth: actorSheetData.character.investmentWealth,
                    investmentDefense: actorSheetData.character.investmentDefense,
                    investmentTotal: actorSheetData.character.investmentTotal,
                    investmentPopulation: actorSheetData.character.population
                }

                // update derived investments
                org.defense.derivedInvestment += land.summarizedData.investmentDefense;
                org.lands.derivedInvestment += land.summarizedData.investmentLand;
                org.wealth.derivedInvestment += land.summarizedData.investmentWealth;
                org.population.derivedInvestment += land.summarizedData.investmentPopulation;

                // update benefits
                org.benefits = [...org.benefits, ...actorSheetData.character.benefits]

                // update fortune bonuses
                org.fortunePoolModifier += land.summarizedData.fortunePoolModifier;
                org.fortuneModifier += land.summarizedData.fortuneModifier;
                org.defenseBonus += land.summarizedData.defenseBonus;
            }
        });
        org.owned.lands = org.owned.lands.sort(function(a, b) {
            return b.summarizedData.investmentTotal - a.summarizedData.investmentTotal || a.name.localeCompare(b.name);
        });

        // build & sort landless land holdings data
        org.owned.terrains = this._checkNull(data.itemsByType['terrain']).sort((a, b) => a.name.localeCompare(b.name));
        org.owned.terrains.forEach((item) => {
            org.lands.derivedInvestment += getData(item).investment;
        });
        org.owned.features = this._checkNull(data.itemsByType['terrainFeature']).sort((a, b) => a.name.localeCompare(b.name));
        org.owned.features.forEach((item) => {
            org.lands.derivedInvestment += getData(item).investment;
        });
        org.owned.buildings = this._checkNull(data.itemsByType['building']).sort((a, b) => a.name.localeCompare(b.name));
        org.owned.buildings.forEach((item) => {
            let itemData = getData(item);
            if (!itemData.isUnderConstruction) {
                org.fortunePoolModifier += itemData.fortunePoolModifier || 0;
                org.fortuneModifier += itemData.fortuneModifier || 0;
                org.defenseBonus += itemData.defenseBonus || 0;
            }
            if (parseInt(itemData.resource) === 5) {
                org.wealth.derivedInvestment += itemData.investment;
            } else if (parseInt(itemData.resource) === 0) {
                org.defense.derivedInvestment += itemData.investment;
            }
            if (itemData.benefit.trim() !== "") {
                org.benefits.push(itemData.benefit)
            }
        });

        // organizations
        org.owned.organizations.forEach((organization) => {
            // update pointer data
            // get the target actor
            let targetActor = game.actors.get(organization.id);
            // update actor item
            if (targetActor) {
                organization.name = targetActor.name;
                organization.img = targetActor.img;
            }
        });
        org.owned.organizations = org.owned.organizations.sort((a, b) => a.name.localeCompare(b.name));
        org.owned.vassals = org.owned.organizations.filter(function (organization) {
            return parseInt(organization.relationship) === 1;
        });

        // vassals
        org.powerFromVassals = 0;
        if (org.owned.vassals.length > 0) { org.powerFromVassals += 20 }
        if (org.owned.vassals.length > 1) { org.powerFromVassals += 10 }
        if (org.owned.vassals.length > 2) {
            let numAdditionalVassals = org.owned.vassals.length - 2;
            org.powerFromVassals += (5 * numAdditionalVassals);
        }
        org.power.derivedInvestment += org.powerFromVassals;

        // units
        org.owned.units.forEach((unit) => {
            // update pointer data
            // get the target actor
            let targetActor = game.actors.get(unit.id);
            // update actor item
            if (targetActor) {
                unit.name = targetActor.name;
                unit.img = targetActor.img;
                unit.investment = getData(targetActor).investment || 0;

                // investment cost
                org.power.derivedInvestment += unit.investment;
            }
        });
        org.owned.units = org.owned.units.sort((a, b) => a.name.localeCompare(b.name));

        // events
        org.owned.events = this._checkNull(data.itemsByType['event']).sort(function(a, b) {
            let aDat = getData(a);
            let bDat = getData(b);
            // sort by custom date (default to entry timestamp)
            return bDat.date.year - aDat.date.year
                || bDat.date.month - aDat.date.month
                || bDat.date.day - aDat.date.day
                || bDat.timestamp - aDat.timestamp;
        });
        // set default modifier for each resource to 0
        resources.forEach((resource) => {
            org[resource].modifier = 0;
        });
        // get resource modifiers from events
        org.owned.events.forEach((event) => {
            resources.forEach((resource) => {
                org[resource].modifier += getData(event).modifiers[resource];
            });
        });

        // build derived data
        org.leaderNamesString = org.leaderNames.join(", ")
        org.stewardNamesString = org.stewardNames.join(", ")
        // resources
        let colorCodes = [
            [255, 105, 97],
            [255, 180, 128],
            [248, 243, 141],
            [66, 214, 164],
            [8, 202, 209],
            [89, 173, 246],
            [157, 148, 255],
            [199, 128, 232]
        ];
        org.resourcesList = resources;
        resources.forEach((resource) => {
            // derived investment
            let invested = org[resource].invested
            if (!org[resource].overrideInvested && org[resource].derivedInvestment) {
                invested = org[resource].derivedInvestment;
            }
            org[resource].investedShow = invested;

            // rating data
            org[resource].rawTotal = org[resource].current + invested + org[resource].modifier;
            org[resource].total = Math.min(org[resource].rawTotal, 70);
            if (org[resource].total > 0) {
                org[resource].rating = Math.ceil(org[resource].total/ 10);
            } else {
                org[resource].rating = 0;
            }
            org[resource].ratingLabel = `CS.sheets.organization.resourceRatings.labels.${org[resource].rating}`;
            org[resource].ratingDesc = `CS.sheets.organization.resourceRatings.${resource}.${org[resource].rating}`;
            org[resource].ratingColor = colorCodes[org[resource].rating];
        });

        // fortune rolls
        // law modifier
        org.fortuneLawMod = 0;
        let lawModifiers = [-20, -10, -5, -2, -1, 0, 1, 2, 5]
        if (org.law.rawTotal <= 71) {
            org.fortuneLawMod = lawModifiers[org.law.rating];
        } else {
            org.fortuneLawMod = lawModifiers[8];
        }
        // population modifier
        org.fortunePopMod = 0;
        let popModifiers = [-10, -5, 0, 1, 3, 1, 0, -5, -10]
        if (org.population.rawTotal <= 71) {
            org.fortunePopMod = popModifiers[org.population.rating];
        } else {
            org.fortunePopMod = popModifiers[8];
        }
        // prepare stewardship roll data
        org.stewards.concat(org.leaders).forEach((character) => {
            // get the target actor
            let targetActor = game.actors.get(character.id);
            // build stewardship formula for actor
            let stewardshipFormula = getAbilityTestFormula(
                targetActor,
                SystemUtils.localize(KEY_CONSTANTS.STATUS),
                SystemUtils.localize(KEY_CONSTANTS.STEWARDSHIP)
            )
            stewardshipFormula.pool += org.fortunePoolModifier;
            stewardshipFormula.modifier += org.fortuneModifier + org.fortuneLawMod + org.fortunePopMod;
            character.fortuneFormula = stewardshipFormula;
        });

            // return
        data.character = org;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find(".owned-list-control").on("click", this._onClickOwnedListControl.bind(this));
        html.find(".equipped").click(this._onEquippedStateChanged.bind(this));
    }

    async _onClickOwnedListControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const itemIndex = parseInt(a.dataset.index);
        const list = a.dataset.list;
        const action = a.dataset.action;
        const orgData = getData(this.actor);
        let currentList = orgData.owned[list];
        // const itemId = currentList[itemIndex].id;

        if ( action === "delete" ) {
            currentList.splice(itemIndex, 1);
            let updatePkg = {};
            updatePkg[`system.owned.${list}`] = currentList;
            await this.actor.update(updatePkg)
        }
    }

    async _onEquippedStateChanged(event) {
        event.preventDefault();
        const eventData = event.currentTarget.dataset;
        let document = this.actor.getEmbeddedDocument('Item', eventData.itemId);
        let collection = [];
        let tempCollection = [];

        let isLeaderPosition = parseInt(eventData.type) === EQUIPPED_CONSTANTS.LEADER_POSITION;
        let isStewardPosition = parseInt(eventData.type) === EQUIPPED_CONSTANTS.STEWARD_POSITION;
        let isUnequipping = parseInt(eventData.type) === 0;

        if (isUnequipping) {
            document.getCSData().equipped = 0;
        } else {
            if (isLeaderPosition) {
                getData(document).equipped = EQUIPPED_CONSTANTS.LEADER_POSITION;
                let items = this.actor.getEmbeddedCollection('Item')
                tempCollection = items.filter((item) => getData(item).equipped === EQUIPPED_CONSTANTS.LEADER_POSITION);
                getData(this.actor).leader = tempCollection[0];
            } else if (isStewardPosition) {
                getData(document).equipped = EQUIPPED_CONSTANTS.STEWARD_POSITION;
                let items = this.actor.getEmbeddedCollection('Item')
                tempCollection = items.filter((item) => getData(item).equipped === EQUIPPED_CONSTANTS.STEWARD_POSITION);
                getData(this.actor).steward = tempCollection[0];
            }
        }

        tempCollection.forEach((item) => {
            collection.push({_id: item._id, "system.equipped": EQUIPPED_CONSTANTS.IS_NOT_EQUIPPED});
            item.onEquippedChanged(this.actor, false);
        });

        collection.push({_id: document._id, "system.equipped": getData(document).equipped});
        document.onEquippedChanged(this.actor, getData(document).equipped > 0);

        await this.actor.updateEmbeddedDocuments('Item', collection);
    }

    async _onDropItemCreate(itemData) {
        let embeddedItem = [];
        let itemsToCreate = [];
        let data = [];

        let eventsCanGenerateModifiers = [];

        let allowedMultiples = ["building", "event", "terrain", "terrainFeature"];
        data = data.concat(itemData);
        for (const doc of data) {
            const item = this.actor.items.find((i) => {
                return (i.name === doc.name && i.type === doc.type);
            });
            if (item && !allowedMultiples.includes(doc.type)) {
                embeddedItem.push(this.actor.getEmbeddedDocument("Item", item.system._id));
            } else {
                if (doc.type === "event") {
                    await this.showAddingEventDialog(doc)
                        .then((result) => {
                            if (!result.cancelled) {
                                let generateData = this._processAddingEvent(result);
                                if (generateData.canGenerate) {
                                    eventsCanGenerateModifiers.push({doc: doc.name, choices: generateData.choices});
                                }
                                doc.system.timestamp = Date.now();
                                itemsToCreate.push(doc);
                            }
                        });
                } else if (this.isItemPermitted(doc.type)) {
                    itemsToCreate.push(doc);
                }
            }
        }

        if (itemsToCreate.length > 0) {
            this.actor.createEmbeddedDocuments("Item", itemsToCreate)
                .then(function(result) {
                    result.forEach((item) => {
                        let event = eventsCanGenerateModifiers.find(ev => ev.doc === item.name);
                        if (event)
                            item.generateModifiers(event.choices);
                        item.onObtained(item.actor);
                    });
                    embeddedItem.concat(result);
                });
        }

        return embeddedItem;
    }


    async showAddingEventDialog(event) {
        LOGGER.trace("show adding event dialog | CSHouseActorSheet |" +
            " csHouseActorSheet.js");
        const template = CSConstants.Templates.Dialogs.ADDING_HOUSE_EVENT;
        const html = await renderTemplate(template, {data: event, choices: CSConstants.HouseResources, id: event.id});
        return new Promise(resolve => {
            const data = {
                title: SystemUtils.localize("CS.dialogs.addingHouseEvent.title"),
                content: html,
                buttons: {
                    normal: {
                        label: SystemUtils.localize("CS.dialogs.actions.save"),
                        callback: html => resolve({data: html[0].querySelector("form"), event: event})
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

    _processAddingEvent(formData) {
        if (!formData.data.generateModifiers.checked)
            return { canGenerate: false };

        let choices = [];
        for (let i = 1; i <= formData.event.data.numberOfChoices; i++) {
            choices.push(formData.data[`resource_${i}`].value);
        }
        return {canGenerate: true, choices: choices};
    }

    /** @override */
    async _onDropActor(event, data) {
        LOGGER.trace("On Drop Actor | OrganizationSheet | organization-sheet.js");
        event.preventDefault();
        let isActorPermitted = true;

        // prevent non-owners from adding actors to this sheet
        if ( !this.actor.isOwner ) return false;

        // get data
        let orgData = getData(this.actor);

        // get source actor dropped and determine if allowed
        fromUuid(data.uuid).then(value => {
            let actor = value;
            let listName = "";

            // no self-adding
            if (actor._id === this.actor._id) {
                console.log("Cannot add organization to itself.")
                return;
            }

            // determine if actor is permitted
            let existingActor;
            if (actor) {
                if (actor.type === "character") { listName = "characters"; }
                else if (actor.type === "land") { listName = "lands"; }
                else if (actor.type === "organization") { listName = "organizations"; }
                else if (actor.type === "unit") { listName = "units"; }
                else { return; }
                existingActor = orgData.owned[listName].find((i) => { return i.id === actor._id; });
            } else {
                isActorPermitted = false;
            }
            if (!this.isActorPermitted(actor.type) || existingActor) { isActorPermitted = false}

            // add actor to this actor
            if (isActorPermitted) {
                console.log(`Adding ${actor.type} actor ${actor.name} to ${this.actor.name}...`);

                // create embedded data object by type
                let actorDataObject = {
                    id: actor._id,
                    type: actor.type,
                    name: actor.name,
                    img: actor.img
                };
                if (actor.type === "character") {
                    actorDataObject["age"] = getData(actor).age;
                    actorDataObject["status"] = getAbilityValue(actor, "status");
                    actorDataObject["positions"] = [];
                    actorDataObject["relationship"] = 0;
                } else if (actor.type === "land") {
                    // get derived data
                    const actorSheetData = actor.sheet.getData();
                    actorDataObject["terrain"] = getData(actor).owned.terrain;
                    actorDataObject["summarizedData"] = {
                        benefits: actorSheetData.character.benefits,
                        defenseBonus: actorSheetData.character.defenseBonus,
                        fortunePoolModifier: actorSheetData.character.fortunePoolModifier,
                        fortuneModifier: actorSheetData.character.fortuneModifier,
                        investmentLand: actorSheetData.character.investmentLand,
                        investmentWealth: actorSheetData.character.investmentWealth,
                        investmentDefense: actorSheetData.character.investmentDefense,
                        investmentPopulation: actorSheetData.character.population,
                        investmentTotal: actorSheetData.character.investmentTotal
                    };
                } else if (actor.type === "organization") {
                    actorDataObject["relationship"] = 0;
                }

                // embed
                let list = orgData.owned[listName];
                list.push(actorDataObject);
                let updatePkg = {}
                updatePkg[`system.owned.${listName}`] = list
                this.actor.update(updatePkg)
            }
        });
    }
}