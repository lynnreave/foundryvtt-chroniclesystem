import { ItemSheetChronicle } from "../item-sheet-chronicle.js";

export class CSRelationshipItemSheet extends ItemSheetChronicle {

    getData() {
        const data = super.getData();
        data.dispositionChoices = {
            Affectionate: "CS.sheets.character.dispositions.affectionate",
            Friendly: "CS.sheets.character.dispositions.friendly",
            Amiable: "CS.sheets.character.dispositions.amiable",
            Indifferent: "CS.sheets.character.dispositions.indifferent",
            Dislike: "CS.sheets.character.dispositions.dislike",
            Unfriendly: "CS.sheets.character.dispositions.unfriendly",
            Malicious: "CS.sheets.character.dispositions.malicious"
        }
        return data;
    }
}