import { ChronicleSystem } from "../system/ChronicleSystem.js";

/**
 * Extend the ActorSheet entity with generic, top-level attributes for the Chronicle System.
 * This is the base ActorSheet entity for the system, from which all other ActorSheet entities derive.
 * Include elements here that will affect all ActorSheet types.
 *
 * @category ActorSheet
 */
export class ActorSheetChronicle extends ActorSheet {

    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.item .item-controls').on('click', (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).parents('.item').find('.description').slideToggle();
        });
        html.find(".item-flag-toggle").on("click", this._onClickItemFlagToggle.bind(this));

        // Update Inventory Item
        html.find('.item-edit').on("click", this._showEmbeddedItemSheet.bind(this));
        html.find('.rollable').click(this._onClickRoll.bind(this));

        // open another sheet
        html.find('.actor-open').click(this._showLinkedActorSheet.bind(this));
    }

    async _onClickRoll(event, targets) {
        await ChronicleSystem.eventHandleRoll(event, this.actor, targets);
    }

    async _onClickItemFlagToggle(event) {
        let eventData = event.currentTarget.dataset;
        let itemId = eventData.itemId;
        let itemFlag = eventData.name
        let currentState = eventData.value === "true";
        // let itemFlag = event.currentTarget.name;
        // let currentState = event.currentTarget.value === "true";
        let targetState = !currentState;
        // get item
        const item = this.actor.items.find((i) => {
            return (i.id === itemId);
        });
        let pkg = {};
        pkg[`system.${itemFlag}`] = targetState;
        await item.update(pkg);
    }

    _showEmbeddedItemSheet(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        item.sheet.render(true);
    }

    _showLinkedActorSheet(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents('.item');
        const linkedActor = this.actor.items.get(li.data('itemId'));
        const linkedActorId = linkedActor.system.targetId;
        const actor = game.actors.get(linkedActorId);
        actor.sheet.render(true);
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
    
    async _onDropItemCreate(itemData) {
        let embeddedItem = [];
        let itemsToCreate = [];
        let data = [];
        data = data.concat(itemData);
        data.forEach((doc) => {
            const item = this.actor.items.find((i) => {
                return (i.name === doc.name && i.type === doc.type);
            });
            if (item) {
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
