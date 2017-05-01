import uuid from "uuid"
import Msg from "./Msg"

export default class ActorCore {
    constructor(id, receive) {
        this.id = id
        // console.log(receive);
        this.receive = new Function("msg", `(${receive}).bind(this)(msg)`)
    }

    spawn(actorClassName) {
        // console.log(actorClassName)
        let childId = "_" + uuid().slice(0, 8)
        postMessage(new Msg(
            "__spawn_child_actor__",
            {actorClassName, childId},
            "__sys__",
            this.id
        ))

        return childId
    }

    // // 给自己发信息
    // send(...props) {
    //     let msg = new Msg(...props)
    //     msg.send()
    // }

    msg(...props) {
        let msg = new Msg(...props)
        msg.sender = this.id
        return msg
    }

    noMatch() {
        console.warn("noMatch")
    }
}
