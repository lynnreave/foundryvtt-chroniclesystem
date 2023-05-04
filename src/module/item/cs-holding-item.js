import {ItemChronicle} from "./item-chronicle.js";
import LOGGER from "../../util/logger.js";

export class CSHoldingItem extends ItemChronicle {
    getTotalInvested() {
        LOGGER.trace(`Get Total Invested | CSHoldingItem | csHoldingItem.js`);
        let data = this.getCSData();

        let total = parseInt(data.investment);
        let features = Object.keys(data.features).map((key) => data.features[key]);
        features.forEach((feature) => {
            total += parseInt(feature.cost);
        });
        LOGGER.debug(`total invested on ${this.name}: ${total} | CSHoldingItem | csHoldingItem.js`);
        return total;
    }
}
