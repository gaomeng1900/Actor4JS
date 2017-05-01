import uuid from "uuid"
const W = require("worker-loader!./actorWorker.js")

const G = this || self

class ActorSys {
    constructor() {
        if (G.__ACTOR_SYS__) {
            console.warn("a ActorSys already exists")
        }
        this.activeActors = {}
        this.definedActors = {}

        this.mailbox = []
    }

    defineActor(actorClass) {
        if (this.definedActors[actorClass.name]) {
            console.warn("re defined", actorClass.name)
        }
        this.definedActors[actorClass.name] = actorClass
    }

    addActor(actor) {
        if (this.activeActors[actor.id]) {
            console.warn("re added", actor.id)
        }
        this.activeActors[actor.id] = actor

        actor.worker.onmessage = (msgEvent) => {
            let msg = msgEvent.data
            switch (msg.type) {
                case "__spawn_child_actor__":
                    this.createActor(msg.data.actorClassName)
                    break
                default:
                    return
            }
        }
    }

    createActor(actorClassName) {
        // TODO: check if registered
        let actor = new this.definedActors[actorClassName]()
        // this.addActor(actor)
        // return null
    }

    send(msg) {
        // 如果是active的actor, 则直接发送
        if (this.activeActors[msg.target]) {
            this.activeActors[msg.target].worker.postMessage(msg)
        } else {
            this.mailbox.push(msg)
        }
    }
}

G.__ACTOR_SYS__ || (G.__ACTOR_SYS__ = new ActorSys())

const ACTOR_SYS = G.__ACTOR_SYS__

export default ACTOR_SYS
