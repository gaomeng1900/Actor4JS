import Actor from "./Actor"
import ACTOR_SYS from "./ActorSys"

export default class ActorRef {
    constructor() {

        let _receive = this.receive.toString()
        const actor = new Actor(_receive)

        // 封装, 禁止外部直接调用receive, 同时允许用户查看该函数内容
        this.receive = doNotCall
        this.receive.toString = this.receive.toSource = _toSource(_receive)
        this.id = actor.id
        this.cloned = false

        this.send = (msg) => {
            msg.target = this.id
            ACTOR_SYS.send(msg)
        }

        this.onMsg = (fn) => {
            actor.worker.onmessage = fn
        }
    }

    static register() {
        ACTOR_SYS.defineActor(this)
    }
}


// 破坏封装提示
function doNotCall(source) {
    console.error("do not call this function in case the encapsulation is broken")
    throw new Error("Encapsulation error")
}

function _toSource(source) {
    return () => source
}
