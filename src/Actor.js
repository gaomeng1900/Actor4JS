import uuid from "uuid"
import * as thread from "./thread"
import { glob } from "./decorators"
import { enumerable } from 'core-decorators'

import ActorSys from "./ActorSys"
import Msg from "./Msg"
const W = require("worker-loader!./actorWorker.js")

const G = window || this

export default class Actor {
    constructor() {
        this.id = uuid()
        this.cloned = false

        let sys = G.__ACTOR_SYS__
        sys.addActor(this)

        this.receive = this.receive.toString()
        this.noMatch = this.noMatch.toString()

        let worker = new W()
        worker.postMessage(new Msg("__init_actor__", this))
        this.worker = worker // 放到前面会导致无法clone
    }



    noMatch() {
        console.warn("noMatch")
    }
}
