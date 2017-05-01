import Msg from "./Msg"
import uuid from "uuid"

export default class ActorCloned {
    constructor(_actor) {
        this.cloned = true
        this.id = _actor.id

        this.children = {}

        this.receive = new Function("msg", `(${_actor.receive}).bind(this)(msg)`)
    }

    spawn(actorClassName) {
        console.log(actorClassName)
        let childId = uuid()
        postMessage(new Msg("__spawn_child_actor__", {actorClassName, childId}))
        return childId
    }

    noMatch() {
        console.warn("noMatch")
    }
}
