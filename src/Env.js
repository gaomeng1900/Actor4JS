/**
 * actor运行环境
 * actor不可调用此环境以外的接口
 * NOTE: 该函数无论如何不能崩溃,
 *       不然下面的所有actor都会失联而且没法自我恢复
 */

import Actor from "./Actor"
import ActorRef from "./ActorRef"

export default class Env {
    constructor(G) {
        G.onmessage = msgEvent => {
            this.dispatchMsg(msgEvent.data)
        }

        // 这里面放的是actor实例本身的引用，唯一能真正接触到actor的地方
        this.actors = {}
        // ask等待的回复
        this.promises = {}

        console.log("Env inited")
    }

    /**
     * 在该环境下创建一个actor
     * 只能根据system的消息自身调用
     * @method createActor
     * @param  {Object}    character actor的关键描述
     */
    createActor(character) {
        try {
            this.actors[character.name] = new Actor(character, this)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 环境内的actor创建子actor之后, 需要得到一个actorRef来与之通信
     * 这里的name需要创建者指定
     * 可以被该环境下的actor调用
     * @method makeActorRef
     * @param  {String}     name
     * @param  {String}     owner
     * @return {ActorRef}
     */
    makeActorRef(name, owner) {
        return new ActorRef(
            name, owner,
            this.makePromise.bind(this),
            this.sendMsg.bind(this)
        )
    }

    /**
     * 信息层模块 ↓
     */

    /**
     * 派发信息,直接绑定为onmessage
     * 这里的msg带有信道信息
     * 根据信道选择对应的处理接口, 把解包(若需要)之后的信息作为参数调用之
     * 对应的接口可能是本环境下的一个actor上的,也可能是this上的
     * * 如果要在主线程中运行, 应该由该接口来区分对sys的调用方式
     * @method dispatchMsg
     * @param  {*}    _msg 结构化信息
     */
    dispatchMsg(_msg) {
        switch (_msg.chanel) {
            case "create_actor": // sys要求在本环境下创建一个actor
                this.createActor(_msg.msg)
                break
            case "supervisor": // 调用supervisorStrategy
                // 第二层路由
                let receiver = this.actors[_msg.receiver]
                if (!receiver) {
                    // TODO: 搞个死信信箱？
                    console.error("no such actor here")
                    return
                }
                // 把sender换成一个ref, 用于方便的返回信息
                // @BOOKMARK
                _msg.sender = this.makeActorRef(_msg.sender, _msg.receiver)
                try {
                    receiver.supervisorStrategy(_msg)
                } catch (e) {
                    // 如果supervisorStrategy直接抛出了错误,
                    // 该错误递归地交给父组件
                    let supervisorMsg = {
                        type: e.name,
                        message: e.message,
                        sender: receiver.name,
                        receiver: receiver.parent
                    }
                    // TODO: 怎么交给父组件
                    // @BOOKMARK
                    this.sendMsg(
                        supervisorMsg,
                        receiver.name,
                        receiver.parent,
                        "supervisor",
                    )
                }
                break
            default: // actor之间的常规信息沟通（用户上下文）
                // 第二层路由
                let receiver = this.actors[_msg.receiver]
                if (!receiver) {
                    // TODO: 搞个死信信箱？
                    console.error("no such actor here")
                    return
                }
                // 对此环境下发起的ask的回复
                if (_msg.sessionState === "response") {
                    this.fulfillPromise(_msg)
                    return
                }
                // NOTE: 这里是直接带着信道信息层传入的
                // 因为sender信息可能用得到
                // TODO: 如果有更好的方式传入sender
                //       就可以剥离掉信道信息等不希望用户看到的信息
                try {
                    receiver.receive(_msg)
                } catch (e) {
                    // 如果receive直接抛出了错误, 该错误应该交给父组件
                    let supervisorMsg = {
                        type: e.name,
                        message: e.message,
                        sender: receiver.name,
                        receiver: receiver.parent
                    }
                    // TODO: 怎么交给父组件
                    // @BOOKMARK
                    this.sendMsg(
                        supervisorMsg,
                        receiver.name,
                        receiver.parent,
                        "supervisor",
                    )
                }

        }
    }

    /**
     * 发送信息,直接操作postMessage
     * - 作为ENV向Sys发管理信息
     * - 被actorRef.tell | ask调用
     * * 如果要在主线程中运行, 应该由该接口来区分对sys的调用方式
     * @method sendMsg
     * @param  {*} msg
     * @param  {String} sender
     * @param  {String} receiver
     * @param  {String} chanel
     * @NOTE: 代码同步到system.js
     */
    sendMsg(msg, sender, receiver, chanel) {
        postMessage({ sender, receiver, chanel, msg })
    }

    // 信息层模块 ↑

    // actorRef中的promise需要在这里管理
    // TODO: 应该是Env的工作

    /**
     * 在actorRef中生成一个Promise返回给用户
     * 并登记会话，等待回复
     * @param  {[type]} sessionID
     * @return {[type]}
     * @NOTE: 代码同步到system.js
     */
    makePromise(sessionID, timeout) {
        let promise = new Promise((resolve, reject) => {
            // 将resolve放入外部
            // 如果及时返回，resolve被调用，reject将会失效
            // 如果reject先被调用，resolve将会失效
            this.promises[sessionID] = (msg) => resolve(msg)
            setTimeout(reject("timeout"), timeout)
        })
        return promise
    }

    // @NOTE: 代码同步到system.js
    fulfillPromise(_msg) {
        let sessionID = _msg.sessionID
        let resolve = this.promises[sessionID]
        if (resolve) {resolve(_msg)}
        delete this.promises[sessionID]
    }
}
