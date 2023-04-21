import factory from "../../util/factory.js";
import { Character } from "./character/character.js";
import { House } from "./house/house.js";
import { Unit } from "./character/unit.js";

// define available actor types
const actorTypes = {};
actorTypes.character = Character;
actorTypes.house = House;
actorTypes.unit = Unit;
// add any new actor types here as actorTypes.newType = newType;

// the actor constructor
const actorConstructor = factory(actorTypes, Actor);

// export
export default actorConstructor;
