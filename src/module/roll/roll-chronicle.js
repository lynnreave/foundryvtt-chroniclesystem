import SystemUtils from "../../util/systemUtils.js";
import {
    getDegrees,
    getTestDifficultyFromCurrentTarget
} from "./rolls.js";

/**
 * A roll object for the Chronicle System.
 */
export class RollChronicle {
    constructor(title, formula) {
        this.formula = formula;
        this.title = title;
        this.entityData = undefined;
        this.rollCard  = "systems/chroniclesystem/templates/chat/cs-stat-rollcard.html";
        this.results = [];
    }

    async doRoll(actor, async = true, rollType = null) {
        if (this.formula.pool - this.formula.dicePenalty <=0 ) {
            ui.notifications.info(SystemUtils.localize("CS.notifications.dicePoolInvalid"));
            return null;
        }
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

        // TODO: this is sloppy code; clean this up with something more professional
        // get test difficulty from target (if specified)
        let testDifficultyData = getTestDifficultyFromCurrentTarget(rollType);
        let testDifficulty = testDifficultyData.difficulty;
        // determine degrees of success/failure
        let degreesMsg = "";
        if (testDifficulty) {
            let degreesData = getDegrees(testDifficulty, resultRoll.total);
            let label = SystemUtils.localize(degreesData.label);
            let m;
            if (degreesData.num > 0) {
                m = SystemUtils.localize("CS.chatMessages.degreesOfSuccess")
            } else {
                m = SystemUtils.localize("CS.chatMessages.degreesOfFailure")
            }
            degreesMsg = ` ${label}! ${degreesData.num} ${m}!`;
            // handle discrete defenses (warfare unit target)
            for (let defense of ["Fighting", "Marksmanship"]) {
                let defenseDifficulty = testDifficultyData[`v${defense}`];
                if (defenseDifficulty && (defenseDifficulty !== testDifficulty)) {
                    let defenseDegreesData = getDegrees(defenseDifficulty, resultRoll.total);
                    if (defenseDegreesData.num !== degreesData.num) {
                        let defenseLabel = SystemUtils.localize(defenseDegreesData.label);
                        let dm;
                        if (degreesData.num > 0) {
                            dm = SystemUtils.localize("CS.chatMessages.degreesOfSuccess")
                        } else {
                            dm = SystemUtils.localize("CS.chatMessages.degreesOfFailure")
                        }
                        degreesMsg += ` ${defenseLabel} if a ${defense.toUpperCase()} test!`;
                        degreesMsg += ` ${defenseDegreesData.num} ${dm}!`;
                    }
                }
            }
        }
        // get name of target (if one exists)
        let targetName;
        let targets = Array.from(game.user.targets);
        if (targets.length > 0) {
            let target = targets[0];
            if (target.document && target.document["_actor"]) {
                targetName = target.document["_actor"]["name"];
            }
        }

        // build chat message for roll result
        // TODO: model this more off pf2e w/ chat output
        let simpleRoll = targetName ? "CS.chatMessages.simpleRollAgainst" : "CS.chatMessages.simpleRoll";
        let customRoll = targetName ? "CS.chatMessages.customRollAgainst" : "CS.chatMessages.customRoll";
        const messageId = this.formula.isUserChanged ? customRoll : simpleRoll;
        let flavor =  SystemUtils.format(
            messageId,
            {
                name: actor.name,
                test: this.title,
                degreesMsg: degreesMsg,
                target: targetName
            }
        );
        resultRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: flavor
        });
        // return
        return resultRoll;
    }
}
