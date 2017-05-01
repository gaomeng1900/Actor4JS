import uuid from "uuid"

const G = this || self

export default class ActorSys {
    constructor() {
        if (G.__ACTOR_SYS__) {
            console.warn("a ActorSys already exists")
        }
        this.actors = []
    }

    addActor(actor) {
        this.actors.push(actor)
    }
}

G.__ACTOR_SYS__ || (G.__ACTOR_SYS__ = new ActorSys())
