import { ActorSheetChronicle } from "../actor-sheet-chronicle.js";
import { getData } from "../../common.js";

/**
 * An ActorSheet entity for handling land holdings.
 *
 * @category Actor
 */
export class LandSheet extends ActorSheetChronicle {
    actorTypesPermitted = [];
    itemTypesPermitted = [
        "building",
        "terrain",
        "terrainFeature"
    ];

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["chroniclesystem", "sheet", "land", "actor"],
            template: "systems/chroniclesystem/templates/actors/holdings/land-sheet.hbs",
            width: 800,
            height: 900,
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    getData(options) {
        let data =  super.getData(options);

        // split items by type
        this.splitItemsByType(data);

        // get org data
        let land = getData(data.actor);

        // build & sort owned data
        land.owned.features = this._checkNull(data.itemsByType['terrainFeature']).sort((a, b) => a.name.localeCompare(b.name));
        land.owned.buildings = this._checkNull(data.itemsByType['building']).sort((a, b) => a.name.localeCompare(b.name));

        // summarized data
        // bonuses
        land.defenseBonus = 0;
        land.fortunePoolModifier = 0;
        land.fortuneModifier = 0;
        // investments
        land.investmentLand = 0;
        land.investmentWealth = 0;
        land.investmentDefense = 0;
        land.investmentTotal = 0;
        // benefits
        land.benefits = [];
        // get data
        land.owned.buildings.forEach((building) => {
            let buildingData = getData(building);
            if (!buildingData.isUnderConstruction) {
                land.defenseBonus += buildingData.defenseBonus || 0;
                land.fortunePoolModifier += buildingData.fortunePoolModifier || 0;
                land.fortuneModifier += buildingData.fortuneModifier || 0;
            }
            if (parseInt(buildingData.resource) === 5) {
                land.investmentWealth += buildingData.investment || 0;
            } else if (parseInt(buildingData.resource) === 0) {
                land.investmentDefense += buildingData.investment || 0;
            }
            if (buildingData.benefit.trim() !== "") {
                land.benefits.push(buildingData.benefit)
            }
            land.investmentTotal += buildingData.investment || 0;
        });
        land.owned.features.forEach((feature) => {
            let featureData = getData(feature);
            land.investmentLand += featureData.investment || 0;
            land.investmentTotal += featureData.investment || 0;
        });

        // return
        data.character = land;
        return data;
    }

    async _onDropItemCreate(itemData) {
        let embeddedItem = [];
        let itemsToCreate = [];
        let data = [];
        let allowedMultiples = ["building", "terrainFeature"];
        data = data.concat(itemData);
        data.forEach((doc) => {
            if (doc.type === "terrain") {
                this.actor.update({"system.owned.terrain": doc})
                return null;
            }
            const item = this.actor.items.find((i) => {
                return (i.name === doc.name && i.type === doc.type);
            });
            if (item && !allowedMultiples.includes(doc.type)) {
                embeddedItem.push(this.actor.getEmbeddedDocument("Item", item.system._id));
            } else {
                if (this.isItemPermitted(doc.type))
                    itemsToCreate.push(doc);
            }
        });

        if (itemsToCreate.length > 0) {
            this.actor.createEmbeddedDocuments("Item", itemsToCreate)
                .then(function(result) {
                    result.forEach((item) => {
                        item.onObtained(item.actor);
                    });
                    embeddedItem.concat(result);
                });
        }

        return embeddedItem;
    }
}
