import uuid from "uuid"
import * as thread from "./thread"
import { glob } from "./decorators"
import { enumerable } from 'core-decorators'

import ACTOR_SYS from "./ActorSys"
import Msg from "./Msg"
const W = require("worker-loader!./actorWorker.js")

const G = window || this

export default class Actor {
    constructor(_receive) {
        this.id = uuid()
        this.cloned = false

        this.receive = _receive

        let worker = new W()
        worker.postMessage(new Msg("__init_actor__", this))
        this.worker = worker // 放到前面会导致无法clone

        this.children = {}

        ACTOR_SYS.addActor(this)
    }

    spawn(actorClassName) {
        console.log(actorClassName)
        let childId = uuid()
        ACTOR_SYS.createActor(actorClassName, childId)
    }

    // TODO
    defineChild() {}

    defineChildren() {}

    noMatch() {
        console.warn("noMatch")
    }
}
