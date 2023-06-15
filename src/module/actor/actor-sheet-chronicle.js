import { ChronicleSystem } from "../system/ChronicleSystem.js";
import { getData } from "../common.js";

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
        html.find(".owned-item-control").on("click", this._onClickOwnedItemControl.bind(this));
        html.find(".item-flag-toggle").on("click", this._onClickItemFlagToggle.bind(this));
        html.find(".actor-flag-toggle").on("click", this._onClickActorFlagToggle.bind(this));
        html.find(".actor-field-update").on("click", this._onClickActorFieldUpdate.bind(this));


        html.find(".owned-list-item-flag-toggle").on("click", this._onClickOwnedListItemFlagToggle.bind(this));
        html.find(".owned-list-item-field-update").on("click", this._onClickOwnedListItemFieldUpdate.bind(this));
        html.find(".owned-list-item-field-update-select").on("change", this._onChangeOwnedListFieldUpdateSelect.bind(this));

        // Update Inventory Item
        html.find('.item-edit').on("click", this._showEmbeddedItemSheet.bind(this));
        html.find('.rollable').click(this._onClickRoll.bind(this));

        // open another sheet
        html.find('.actor-open').click(this._showLinkedActorSheet.bind(this));
        html.find('.open-actor-sheet').click(this._openActorSheet.bind(this));

        // refresh sheet data
        html.find('.refresh-sheet').on("click", this._refreshSheet.bind(this))
    }

    async _onChangeOwnedListFieldUpdateSelect(event) {
        // event.preventDefault();
        // get data
        const eventData = event.currentTarget.dataset;
        const itemId = eventData.id;
        const list = eventData.list;
        const actorField = eventData.name;
        const value = event.currentTarget.value;
        const actorData = getData(this.actor)

        // update current list
        let currentList = actorData.owned[list];
        currentList.find((item) => {
            if (item.id === itemId) {
                item[actorField] = value;
            }
        });

        // push update
        let updatePkg = {};
        updatePkg[`system.owned.${list}`] = currentList;
        await this.actor.update(updatePkg)
    }

    async _onClickOwnedItemControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const itemIndex = parseInt(a.dataset.index);
        const list = a.dataset.list;
        const action = a.dataset.action;
        const itemId = this.actor.system.owned[list][itemIndex]._id

        if ( action === "delete" ) {
            await this.actor.deleteEmbeddedDocuments("Item", [itemId,])
        }
    }

    async _onClickRoll(event, targets) {
        await ChronicleSystem.eventHandleRoll(event, this.actor, targets);
    }

    async _onClickActorFieldUpdate(event) {
        let eventData = event.currentTarget.dataset;
        let actorField = eventData.field;
        let value = parseInt(eventData.value || 0);
        let max = parseInt(eventData.max);
        let min = parseInt(eventData.min);
        // handle min/max
        if (max) { value = Math.min(value, max); }
        if (!isNaN(min)) { value = Math.max(value, min); }
        // update actor
        let pkg = {};
        pkg[`system.${actorField}`] = value;
        await this.actor.update(pkg);
    }

    async _onClickActorFlagToggle(event) {
        let eventData = event.currentTarget.dataset;
        let actorFlag = eventData.name;
        let currentState = eventData.value === "true";
        let targetState = !currentState;
        let pkg = {};
        pkg[`system.${actorFlag}`] = targetState;
        await this.actor.update(pkg);
    }

    async _onClickOwnedListItemFlagToggle(event) {
        // get data
        const eventData = event.currentTarget.dataset;
        const itemId = eventData.id;
        const list = eventData.list;
        const actorFlag = eventData.name;
        const currentState = eventData.value === "true";
        const targetState = !currentState;
        const actorData = getData(this.actor)

        // update current list
        let currentList = actorData.owned[list];
        currentList.find((item) => {
            if (item.id === itemId) {
                item[actorFlag] = targetState;
            }
        });

        // push update
        let updatePkg = {};
        updatePkg[`system.owned.${list}`] = currentList;
        await this.actor.update(updatePkg)
    }

    async _onClickOwnedListItemFieldUpdate(event) {
        // get data
        const eventData = event.currentTarget.dataset;
        const itemId = eventData.id;
        const list = eventData.list;
        const actorField = eventData.name;
        const value = eventData.value;
        const actorData = getData(this.actor)

        // update current list
        let currentList = actorData.owned[list];
        currentList.find((item) => {
            if (item.id === itemId) {
                item[actorField] = value;
            }
        });

        // push update
        let updatePkg = {};
        updatePkg[`system.owned.${list}`] = currentList;
        await this.actor.update(updatePkg)
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

    _refreshSheet(event) {
        event.preventDefault();
        this.actor.sheet.render(true)
    }

    _showEmbeddedItemSheet(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents('.item');
        const itemId = li.data('itemId');
        const item = this.actor.items.get(itemId);
        item.sheet.render(true);
    }

    _openActorSheet(ev) {
        ev.preventDefault();
        const id = ev.currentTarget.dataset.id;
        const actor = game.actors.get(id);
        if (actor)
            actor.sheet.render(true);
    }

    _showLinkedActorSheet(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents('.item');
        const linkedActor = this.actor.items.get(li.data('itemId'));
        const linkedActorId = linkedActor.system.targetId;
        const actor = game.actors.get(linkedActorId);
        actor.sheet.render(true);
    }

    // isItemPermitted(type) {
    //     return true;
    // }

    isActorPermitted(type) { return this.actorTypesPermitted.includes(type); }

    isItemPermitted(type) { return this.itemTypesPermitted.includes(type); }

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

    async _onDropFolder(event, data) {
        await super._onDropFolder(event, data);
        fromUuid(data.uuid).then(value => {
            let folder = value;
            folder.contents.forEach((doc) => {
                // TODO: make this more efficient by not running onDropItemCreate per item
                if (doc.documentName === "Item") {
                    this._onDropItemCreate(doc);
                }
            });
        })
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
