/**
 * 所有Worker的基本程序
 */

import uuid from "uuid"
import ActorCloned from "./ActorCloned"

const id = uuid()

let actor = {receive: () => { console.warn("no act defined!") }}

onmessage = (msgEvent) => {
    const msg = msgEvent.data
    // console.log(msg)
    switch (msg.type) {
        case "__init_actor__":
            actor = new ActorCloned(msg.data)
            console.log(`#actorWorker: I'm worker for ${actor.id}, ready to go.`)
            break

        case "__define_child__":
            actor = new ActorCloned(msg.data)
            break

        default:
            actor.receive(msg)

    }
}
