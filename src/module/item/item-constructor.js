import factory from "../../util/factory.js";
import { Weapon } from "./weapon/weapon.js";
import { ItemChronicle } from "./item-chronicle.js";
import { CSAbilityItem } from "./csAbilityItem.js";
import { CSArmorItem } from "./csArmorItem.js";
import { Event } from "./event/event.js";
import { CSHoldingItem } from "./cs-holding-item.js";
import { CSTechniqueItem } from "./cs-technique-item.js";
import { Effect } from "./effect/effect.js";

// define available item types
const itemTypes = {};
itemTypes.ability = CSAbilityItem;
itemTypes.actionCombat = ItemChronicle;
itemTypes.actionIntrigue = ItemChronicle;
itemTypes.armor = CSArmorItem;
itemTypes.benefit = ItemChronicle;
itemTypes.building = ItemChronicle;
itemTypes.drawback = ItemChronicle;
itemTypes.effect = Effect;
itemTypes.equipment = ItemChronicle;
itemTypes.event = Event;
itemTypes.hero = ItemChronicle;
itemTypes.holding = CSHoldingItem;
itemTypes.mount = ItemChronicle;
itemTypes.order = ItemChronicle;
itemTypes.position = ItemChronicle;
itemTypes.relationship = ItemChronicle;
itemTypes.technique = CSTechniqueItem;
itemTypes.terrain = ItemChronicle;
itemTypes.terrainFeature = ItemChronicle;
itemTypes.weapon = Weapon;
// add any new item types here as itemTypes.newType = newType;

// the item constructor
const itemConstructor = factory(itemTypes, Item);

// export
export default itemConstructor;
