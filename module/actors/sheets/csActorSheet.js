import {ChronicleSystem} from "../../system/ChronicleSystem.js";
import LOGGER from "../../utils/logger.js";

export class CSActorSheet extends ActorSheet {

    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.item .item-controls').on('click', (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).parents('.item').find('.description').slideToggle();
        });

        // Update Inventory Item
        html.find('.item-edit').click(this._showEmbeddedItemSheet.bind(this));
        html.find('.rollable').click(this._onClickRoll.bind(this));
    }

    async _onClickRoll(event, targets) {
        await ChronicleSystem.eventHandleRoll(event, this.actor, targets);
    }

    _showEmbeddedItemSheet(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        item.sheet.render(true);
    }

    isItemPermitted(type) {
        return true;
    }

    splitItemsByType(data) {
        data.itemsByType = {};
        for (const item of data.items) {
            let list = data.itemsByType[item.type];
            if (!list) {
                list = [];
                data.itemsByType[item.type] = list;
            }
            list.push(item);
        }
    }

    setPosition(options={}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    _checkNull(items) {
        if (items && items.length) {
            return items;
        }
        return [];
    }

    async _onDropActor(event, data) {
        LOGGER.trace("On Drop Actor | CSActorSheet | csActorSheet.js");

        // drop actor to create new relationship (if it does not already exist)
        let embeddedItem = [];
        let sourceId = this.actor._id;
        let sourceActor = this.actor;
        let targetId = data.uuid.replace('Actor.', '');
        let targetActor = game.actors.get(targetId);
        let isRelationshipPermitted = true;

        // determine if relationship can be created
        const existingRelationship = sourceActor.items.find((i) => {
            return i.name === targetActor.name;
        });
        if (!this.isItemPermitted("relationship")) {
            LOGGER.trace("Relationships are not permitted for this actor type.");
        } else if (existingRelationship) {
            LOGGER.trace(`${sourceActor.name} already has a relationship with ${targetActor.name}.`);
            isRelationshipPermitted = false;
        } else {
            LOGGER.trace(`${sourceActor.name} does not yet have a relationship with ${targetActor.name}.`);
        }

        // create relationship
        if (isRelationshipPermitted) {
            LOGGER.trace(`Creating relationship with ${targetActor.name} for ${sourceActor.name}`);
            let relationshipDataObject = {
                id: targetId,
                type: "relationship",
                name: targetActor.name,
                img: targetActor.img,
                disposition: "Indifferent",
                description: ""
            }
            // this.actor.items.push({ key: targetId, value: relationshipDataObject })
            this.actor.createEmbeddedDocuments("Item", [relationshipDataObject])
                .then(function(result) {
                    embeddedItem.concat(result);
                });
        }

        return embeddedItem;
    }
    
    async _onDropItemCreate(itemData) {
        let embeddedItem = [];
        let itemsToCreate = [];
        let data = [];
        data = data.concat(itemData);
        data.forEach((doc) => {
            const item = this.actor.items.find((i) => {
                return i.name === doc.name;
            });
            if (item) {
                embeddedItem.push(this.actor.getEmbeddedDocument("Item", item.data._id));
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
