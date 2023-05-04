import factory from "../../util/factory.js";
import { CSWeaponItem } from "./csWeaponItem.js";
import { ItemChronicle } from "./item-chronicle.js";
import { CSAbilityItem } from "./csAbilityItem.js";
import { CSArmorItem } from "./csArmorItem.js";
import { CSEventItem } from "./csEventItem.js";
import { CSHoldingItem } from "./cs-holding-item.js";
import { CSTechniqueItem } from "./cs-technique-item.js";
import { Effect } from "./effect/effect.js";

// define available item types
const itemTypes = {};
itemTypes.weapon = CSWeaponItem;
itemTypes.armor = CSArmorItem;
itemTypes.ability = CSAbilityItem;
itemTypes.benefit = ItemChronicle;
itemTypes.drawback = ItemChronicle;
itemTypes.equipment = ItemChronicle;
itemTypes.event = CSEventItem;
itemTypes.holding = CSHoldingItem;
itemTypes.technique = CSTechniqueItem;
itemTypes.relationship = ItemChronicle;
itemTypes.hero = ItemChronicle;
itemTypes.effect = Effect;
// add any new item types here as itemTypes.newType = newType;

// the item constructor
const itemConstructor = factory(itemTypes, Item);

// export
export default itemConstructor;
