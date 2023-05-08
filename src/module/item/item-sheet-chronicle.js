import SystemUtils from "../../util/systemUtils.js";
import { COMBAT_ACTION_TYPES } from "../selections.js";
import { getData } from "../common.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ItemSheetChronicle extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding","chroniclesystem", "sheet", "item"],
            width: 650,
            height: 560,
        });
    }

    get template() {
        const path = 'systems/chroniclesystem/templates/items';
        return `${path}/${this.item.type}.hbs`;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-flag-toggle").on("click", this._onClickItemFlagToggle.bind(this));
        html.find('.item-delete').click((ev) => {
            if (this.item.actor) {
                this.item.actor.deleteEmbeddedDocuments("Item", [this.item._id,]);
            }
        });
        html.find(".item-qualities-control").on("click", this._onClickItemQualityControl.bind(this));
        html.find('.item-quality-create').on("click", this._onClickItemQualityCreate.bind(this));
        html.find('.item-send-to-chat').on("click",this._onSendItemToChat.bind(this));
    }

    async _onClickItemQualityCreate(ev) {
        const item = this.item;
        let quality = {
            name: "",
            parameter: ""
        };
        let newQuality = Object.values(item.getCSData().qualities);
        newQuality.push(quality);
        item.update({"system.qualities" : newQuality});
    }

    async _onClickItemQualityControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const index = parseInt(a.dataset.id);
        const action = a.dataset.action;

        // Remove existing specialty
        if ( action === "delete" ) {
            const item = this.item;
            let qualities = Object.values(item.getCSData().qualities);
            qualities.splice(index,1);
            item.update({"system.qualities" : qualities});
        }
    }

    async _onClickItemFlagToggle(event) {
        let itemFlag = event.currentTarget.name;
        let currentState = event.currentTarget.value === "true";
        let targetState = !currentState;
        let pkg = {};
        pkg[`system.${itemFlag}`] = targetState;
        await this.item.update(pkg);
    }

    async _onSendItemToChat(event){
        event.preventDefault();
        let item = this.item;
        // build chat data
        let itemName = item.name;
        let itemDesc = getData(item).description;
        let itemType = event.currentTarget.dataset.itemType;
        let chatData = {
            speaker: {actor: this.actor},
            content: `<h1>${itemName}</h1>${itemDesc}`
        }
        // handle action item type
        if (itemType && itemType === "action") {
            let actionItemType = SystemUtils.localize(COMBAT_ACTION_TYPES[getData(item).type].name)
            chatData.content = `<p><b>${actionItemType} ${SystemUtils.localize("CS.sheets.actionItem.action")}</b></p><h1>${itemName}</h1>${itemDesc}`
        }
        // send to chat
        await ChatMessage.create(chatData)
    }


    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    setPosition(options={}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 142;
        sheetBody.css("height", bodyHeight);
        return position;
    }
}
