import { ActorSheetChronicle } from "../actor-sheet-chronicle.js";
import { getData } from "../../common.js";
import LOGGER from "../../../util/logger.js";
import { getAbilityValue } from "../character/abilities.js";

/**
 * An ActorSheet entity for handling organizations.
 *
 * @category Actor
 */
export class OrganizationSheet extends ActorSheetChronicle {
    actorTypesPermitted = [
        "character"
    ];
    itemTypesPermitted = [
        "position"
    ];

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["chroniclesystem", "sheet", "house", "actor"],
            template: "systems/chroniclesystem/templates/actors/organizations/organization-sheet.hbs",
            width: 800,
            height: 800,
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: "structure"
                }
            ],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    getData(options) {
        let data =  super.getData(options);

        // split items by type
        this.splitItemsByType(data);

        // get org data
        let org = getData(data.actor);

        // update embedded actors data
        org.owned.characters.forEach((character) => {
            // get the target actor
            let targetActor = game.actors.get(character.id);
            // update actor item
            if (targetActor) {
                character.name = targetActor.name;
                character.img = targetActor.img;
                character.age = getData(targetActor).age;
                character.status = getAbilityValue(targetActor, "status");
            }
            // if (!character.relationship) { character.relationship = 0; }
        })

        // sort & build ownership lists
        org.owned.positions = this._checkNull(data.itemsByType['position']).sort((a, b) => a.name.localeCompare(b.name));


        // sort owned characters (associates)
        org.owned.characters = org.owned.characters.sort(function(a, b) {
            return b.status - a.status || a.name.localeCompare(b.name);
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

    isActorPermitted(type) { return this.actorTypesPermitted.includes(type); }

    isItemPermitted(type) { return this.itemTypesPermitted.includes(type); }

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
            let existingActor;
            if (actor) {
                existingActor = orgData.owned.characters.find((i) => { return i.id === actor._id; });
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
                    img: actor.img,
                    // derived values
                    positions: [],
                    relationship: 0
                };
                if (actor.type === "character") {
                    actorDataObject["age"] = getData(actor).age;
                    actorDataObject["status"] = getAbilityValue(actor, "status");
                }

                // embed
                let list = orgData.owned.characters;
                list.push(actorDataObject);
                this.actor.update({"system.owned.characters": list})
            }
        });
    }
}