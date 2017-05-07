/**
 * ActorSystem
 * 单例对象
 */

import ActorRef from "./ActorRef"
const W = require("worker-loader!./worker.js") // 线程booter

const G = self
const confDefault = {
    pool: 5, // 线程池数量(不包括主线程)
}

class ActorSys {
    constructor(conf) {
        // singleton
        if (G.__ACTOR_SYS__) {
            throw new Error("ActorSystem should be a singleton")
        }
        G.__ACTOR_SYS__ = this

        this.conf = { ...confDefault, ...conf }
        let conf = this.conf
        if (conf.pool < 1) { throw new Error("pool must >= 1") }

        // 创建Worker(分配线程)
        this.workers = []
        let i = conf.pool
        while (i--) {
            this.createWorker()
        }

        // actor定义信息
        this.characters = {}
        // actor信息
        this.actors = {}
        // ask等待的回复
        this.promises

        console.log("ActorSystem inited")

        this.pointer = 0 // 调度用
    }

    /**
     * 创建一个Worker, 加入Worker列表, 并监听该Worker的信息
     * @method createWorker
     */
    createWorker() {
        let worker = new W()
        worker.onmessage = msgEvent => {
            this.onmessage(msgEvent.data)
        }
        this.workers.push(worker)
    }

    /**
     * 注册一个 actor Class
     * 这里不使用 Class extends, 兼容性不好而且还是要单独register
     * 只有注册过的actorClass才能创建
     * @method define
     * @param  {String} className
     * @param  {Object} actorClass
     * @return {String} className
     */
    define(className, character) {
        // 检查是否重名
        if (this.characters[className]) {console.error("duplicated name")}
        // 检查关键特性是否定义
        if (!character.receive) {console.error("receive undefined")}
        // 录入
        this.characters[className] = character
    }

    /**
     * 创建actor, 以sys为父
     * 由用户直接调用
     * @method actorOf
     * @param  {String} className
     * @param  {String} actorName
     * @return {ActorRef}
     */
    actorOf(className, actorName) {
        // 创建
        this.createActor(className, actorName, "__root__")
        return new ActorRef(
            actorName, "__root__", 
            this.makePromise.bind(this)
        )
    }

    /**
     * 创建actor
     * 根据调度方案指派一个Worker, 向其发送创建指令以及actor的character
     * character 应该包含name
     * @method createActor
     * @param  {String} className
     * @param  {String} actorName
     */
    createActor(className, actorName, parent) {
        // 检查是否定义
        let character = this.characters[className]
        if (!character) {console.error("className undefined")}
        // 检查是否重名
        if (this.actors[actorName]) {console.error("duplicated name")}
        // 选择一个Worker, 调度方案: 挑兵挑将......
        let workerIndex = this.pointer ++
        if (this.pointer > this.pool - 1) { this.pointer = 0 }
        // 向其发送创建指令
        this.postMessage({
            channel: "create_actor",
            worker: workerIndex,
            sender: "__sys__",
            // receiver: "",
            // session: "",
            msg: {
                name: actorName,
                parent: parent,
                ...character,
            }
        })
        // 录入信息(用于信息路由)
        this.actors[actorName] = {workerIndex, parent}
    }

    /**
     * 信息层模块 ↓
     * 信息源和发送对象都是Worker(即Worker里的Env)
     */

    /**
     * 直接绑定到每个Worker的onmessage上
     * 处理所有Env发来的信息
     * 选择下面的某个方法处理该信息
     * @method onmessage
     * @param  {*}    _msg 结构化信息
     */
    onmessage(_msg) {
        switch (_msg.channel) {
            case "create_actor":
                // 需要sys处理的特殊信道
                this.hCreateActor(_msg)
                break
            default:
                if (_msg.receiver === "__sys__") {
                    // 返回给用户的普通信息
                    this.fulfillPromise(_msg)
                } else {
                    // 普通信道以及不需要sys处理的特殊信道
                    this.hForward(_msg)
                }
        }
    }

    /**
     * 发送信息,直接操作Worker.postMessage
     * @method postMessage
     * @param  {*} _msg
     */
    postMessage(_msg) {
        // 路由
        let workerIndex = _msg.worker ||
                          this.actors[_msg.receiver].workerIndex
        // 发送
        this.workers[workerIndex].postMessage(_msg)
    }

    // END 信息层模块 ↑

    // 各种handler ↓

    /**
     * handler: actor之间转发信息
     * @method forward
     * @param  {*} _msg
     */
    hForward(_msg) {
        // 忽略信道，信道由Env层进行路由
        this.postMessage(_msg)
    }

    /**
     * handler: 创建子actor
     * @method hCreateActor
     * @param  {*} _msg
     */
    hCreateActor(_msg) {
        let msg = _msg.msg
        this.createActor(msg.className, msg.actorName, msg.sender)
    }

    // actorRef中的promise需要在这里管理
    // TODO: 应该是Env的工作

    /**
     * 在actorRef中生成一个Promise返回给用户
     * 并登记会话，等待回复
     * @param  {[type]} sessionID
     * @return {[type]}          
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

    fulfillPromise(_msg) {
        let sessionID = _msg.sessionID
        let resolve = this.promises[sessionID]
        if (resolve) {resolve(_msg.msg)}
        delete this.promises[sessionID]
    }
}

// G.__ACTOR_SYS__ || (G.__ACTOR_SYS__ = new ActorSys())
// const ACTOR_SYS = G.__ACTOR_SYS__
export default ActorSys
