import factory from "../utils/factory.js";
import {CSCharacterActor} from "./csCharacterActor.js";
import {CSHouseActor} from "./csHouseActor.js";
import {CSUnitActor} from "./csUnitActor.js";

// define available actor types
const actorTypes = {};
actorTypes.character = CSCharacterActor;
actorTypes.house = CSHouseActor;
actorTypes.unit = CSUnitActor;
const actorConstructor = factory(actorTypes, Actor);
export default actorConstructor;