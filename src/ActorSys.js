import uuid from "uuid"

const G =  self

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

    // 把一个actors加入活跃actors中
    // 直接被ActorsRef的构造函数调用, 以保证每一个actors都被加入系统
    addActor(actor) {
        if (this.activeActors[actor.id]) {
            console.warn("re added", actor.id)
        }
        this.activeActors[actor.id] = actor

        actor.onmessage = (msgEvent) => {
            let msg = msgEvent.data
            switch (msg.type) {
                case "__spawn_child_actor__":
                    this.createActor(msg)
                    break
                case "__transpond__":
                    this.send(msg.data)
                    break

                default:
                    return
            }
        }

        // 以免异步延迟??
        // let i = this.mailbox.length
        // while (i--) {
        //     if (this.mailbox[i].target === actor.id) {
        //         actor.postMessage(msg)
        //     }
        // }
    }

    // createActor(actorClassName, id, parentId) {
    //     // TODO: check if registered
    //     let actor = new this.definedActors[actorClassName](id, parentId)
    //     // this.addActor(actor)
    //     // return null
    // }

    createActor(msg) {
        this.activeActors[msg.sender].children.push(msg.data.childId)
        let generation = this.activeActors[msg.sender].generation + 1
        new this.definedActors[msg.data.actorClassName](
            msg.data.childId,
            msg.sender,
            generation
        )
    }

    // 所有Msg都必须发送到这里
    // 无论是主线程还是Worker线程
    send(msg) {
        // 转发型信息
        if (msg.type === "__transpond__") {
            console.log(msg)
            msg = msg.data
        }

        // 如果是active的actor, 则直接发送(推到其本地信箱)
        // 否则放到全局信箱里
        if (this.activeActors[msg.target]) {
            this.activeActors[msg.target].postMessage(msg)
        } else {
            this.mailbox.push(msg)
        }
    }

    print() {
        // actor tree
        console.log("====================================")
        Object.keys(this.activeActors).forEach(key => {
            let actor = this.activeActors[key]
            if (actor.generation) {
                console.log(actor.parentId,"<-", actor.id,  actor.generation)
            } else {
                console.log(actor.id, actor.generation)
            }
        })
        console.log("====================================")
    }
}

G.__ACTOR_SYS__ || (G.__ACTOR_SYS__ = new ActorSys())

const ACTOR_SYS = G.__ACTOR_SYS__

export default ACTOR_SYS
