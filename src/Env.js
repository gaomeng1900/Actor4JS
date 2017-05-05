/**
 * actor运行环境
 * actor不可调用此环境以外的接口
 */

import Actor from "./Actor"
import ActorRef from "./ActorRef"

export default class Env {
    constructor() {
        this.id = uuid()
    }

    /**
     * 在该环境下创建一个actor
     * @method createActor
     * @param  {Object}    charactor actor的关键描述
     */
    createActor(charactor) {}

    /**
     * 派发信息,直接绑定为onmessage
     * 这里的msg带有信道信息
     * 根据信道选择对应的处理接口, 把解包(若需要)之后的信息作为参数调用之
     * 对应的接口可能是本环境下的一个actor上的,也可能是this上的
     * @method dispatchMsg
     * @param  {*}    msg 结构化信息
     */
    dispatchMsg(msg) {}

    /**
     * 发送信息,直接绑定postMessage
     * - 作为ENV向Sys发管理信息
     * - 被actorRef.tell | ask调用
     * @method sendMsg
     * @param  {*} msg
     * @param  {String} sender
     * @param  {String} receiver
     */
    sendMsg(msg, sender, receiver) {}

    /**
     * 环境内的actor创建子actor之后, 需要得到一个actorRef来与之通信
     * 这里的name需要创建者指定
     * @method makeActorRef
     * @param  {String}     name
     * @param  {String}     owner
     * @return {ActorRef}
     */
    makeActorRef(name, owner) {
        return new ActorRef(name, owner)
    }
}
