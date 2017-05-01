/**
 * 所有Worker的基本程序
 */

import uuid from "uuid"
import ActorCore from "./ActorCore"

let actorCore = {receive: () => { console.warn("undefined!") }}

onmessage = (msgEvent) => {
    const msg = msgEvent.data
    // console.log(msg)
    switch (msg.type) {
        case "__init_actor__":
            actorCore = new ActorCore(msg.data.id, msg.data.receive)
            console.log(`#actorWorker: I'm worker for ${actorCore.id}, ready to go.`)
            break

        default:
            actorCore.receive(msg)

    }
}
