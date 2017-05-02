import uuid from "uuid"
import Msg from "./Msg"
const W = require("worker-loader!./actorWorker.js")

export default class Actor {
    constructor(id, receive, parentId, generation = 0) {
        this.id = id
        this.parentId = parentId
        this.generation = generation
        // this.receive = new Function("msg", `(${receive}).bind(this)(msg)`)
        this.receive = receive
        this.children = []

        // worker.postMessage(new Msg("__init_actor__", this))
        // this.worker = worker // 放到前面会导致无法clone

        // 创建一个Worker
        let worker = new W()
        // 初始化Worker中的core
        worker.postMessage(new Msg("__init_actor__", this))
        this.worker = worker // 放到前面会导致无法clone
        this.active = true
    }


    postMessage(msg) {
        this.worker.postMessage(msg)
    }

    terminate() {
        this.worker.terminate()
        this.active = false
    }

    set onmessage(fn) {
        this.worker.onmessage = fn
    }
}
