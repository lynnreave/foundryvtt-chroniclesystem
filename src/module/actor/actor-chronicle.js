import { getData } from "../common.js"

/**
 * Extend the Actor entity with generic, top-level attributes for the Chronicle System.
 * This is the base Actor entity for the system, from which all other Actor entities derive.
 * Include elements here that will affect all Actor types.
 *
 * @category Actor
 */
export class ActorChronicle extends Actor {
  getData() { return getData(this); }
}
