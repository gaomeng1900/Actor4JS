/**
 * 所有Worker的基本程序
 */

import uuid from "uuid"
import ActorCloned from "./ActorCloned"
import ActorSys from "./ActorSys"

const id = uuid()

console.log(`#actorWorker: I'm worker ${id}, ready to go.`)

// let act = () => {console.warn("no act defined!")}

let actor = {receive: () => { console.warn("no act defined!") }}

onmessage = (msgEvent) => {
    const msg = msgEvent.data
    // console.log(msg)
    switch (msg.type) {
        case "__init_actor__":
            actor = new ActorCloned(msg.data)
            break
        default:
            actor.receive(msg)

    }
}

// function initActor(_actor) {
//     actor.receive = new Function("msg", `(${_actor.receive}).bind(this)(msg)`)
//     actor.noMatch = new Function("msg", `(${_actor.noMatch}).bind(this)(msg)`)
// }
