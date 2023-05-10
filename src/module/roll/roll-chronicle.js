import SystemUtils from "../../util/systemUtils.js";
import {
    adjustFormulaByMount,
    getRollTemplateData
} from "./rolls.js";

/**
 * A roll object for the Chronicle System.
 */
export class RollChronicle {
    constructor(title, formula) {
        this.formula = formula;
        this.title = title;
        this.entityData = undefined;
        this.results = [];
    }

    async doRoll(actor, async = true, rollType = null) {
        if (this.formula.pool - this.formula.dicePenalty <=0 ) {
            ui.notifications.info(SystemUtils.localize("CS.notifications.dicePoolInvalid"));
            return null;
        }
        // adjust formula by mount
        adjustFormulaByMount(actor, this.formula);
        // roll dice
        const pool = Math.max(this.formula.pool, 1);
        const dices = pool + this.formula.bonusDice;
        let dieRoll = new Die({faces: 6, number: dices});
        await dieRoll.evaluate({async : async});
        this.results = dieRoll.results;
        //
        let reRollFormula = "r"+this.formula.reRoll+"=1";
        dieRoll.reroll(reRollFormula);
        // drop/replace dice
        dieRoll.keep('kh' + Math.max(this.formula.pool - this.formula.dicePenalty, 0));
        // format
        const plus = new OperatorTerm({operator: "+"});
        plus.evaluate();
        const bonus = new NumericTerm({number: this.formula.modifier});
        bonus.evaluate();
        // build roll results
        let resultRoll = Roll.fromTerms([dieRoll, plus, bonus]);

        // render roll card template w/ data to chat
        // TODO: confirm GM Rolls, Private Rolls, Blind Rolls work
        let chatData = {
            user: game.user.id,
            // speaker: ChatMessage.getSpeaker({ actor: this.actor })
        };
        let template = "systems/chroniclesystem/templates/chat/roll-card.hbs"
        let templateData = getRollTemplateData(
            actor, rollType, this.formula, resultRoll, this.results, this.title
        );
        renderTemplate(template, templateData).then(content => {
            chatData.content = content;
            // TODO: support this?
            // if (game.dice3d) {
            //     game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));
            // }
            // else {
                chatData.sound = CONFIG.sounds.dice;
                ChatMessage.create(chatData);
            // }
        });

        // return
        return resultRoll;
    }
}
