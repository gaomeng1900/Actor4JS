import uuid from "uuid"
import Msg from "./Msg"
import Actor from "./Actor"
import ACTOR_SYS from "./ActorSys"

export default class ActorRef {
    constructor(id, parentId, generation=0) {
        this.id = id || "_" + uuid().slice(0, 8)

        // 1. 根据receive方法, 创建一个actor, 为之分配一个worker
        let _receive = this.receive.toString()
        const actor = new Actor(this.id, _receive, parentId, generation)
        // 2. 加入 系统的 active actors
        ACTOR_SYS.addActor(actor)

        // 封装, 禁止外部直接调用receive, 同时允许用户查看该函数内容
        this.receive = doNotCall
        this.receive.toString = this.receive.toSource = _toSource(_receive)

        // 转发消息接口
        // this.msg(msgProps).to(targetId)
        this.msg = (...props) => {
            let msg = new Msg(...props)
            msg.sender = this.id
            return msg
        }

        // 3. 快速发送接口, 转接到sys上
        this.send = (...props) => {
            let msg = new Msg(...props)
            msg.target = this.id
            ACTOR_SYS.send(msg)
        }

    }

    static register() {
        // 0. 注册到系统中, 用于在隔离的环境中创建child actor
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
