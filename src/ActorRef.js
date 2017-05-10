/**
 * 对另一个actor进行远程调用的唯一接口
 */

export default class ActorRef {
    constructor(name, owner, makePromise, sendMsg) {
        // NOTE: 外部有需要 <del>也可以放到闭包里</del>
        this.getName = () => name
        this.getOwner = () => owner
        // NOTE: 可能导致this指向问题
        // NOTE: 放到闭包里, 避免直接调用
        // this.makePromise = makePromise
        // this.sendMsg = sendMsg

        /**
         * 向这个actor发送信息
         * 投递是不被保证的
         * 由于没有人能直接拿到某个actor的引用, 该接口只有ActorRef需要实现的
         * @ref 调用环境层接口, 讲msg送入通信层
         * @core 禁止调用
         * @method tell
         * @param {*} msg
         * @param {String} sessionID 如果有的话就reply, 没有就普通tell
         */
        this.tell = (msg, sessionID) => {
            sendMsg(
                msg,
                this.owner,
                this.name,
                "normal",
                // 如果有
                sessionID ? "response" : undefined,
                sessionID,
            )
        }

        /**
         * 发送请求并等待回复
         * 投递和回复都是不被保证的
         * 该接口只有ActorRef需要实现的
         * @ref 调用环境层接口, 讲msg送入通信层
         * @core 禁止调用
         * @method ask
         * @param  {[type]} msg
         * @param  {[type]} timeout
         * @return {Promise}
         */
        this.ask = (msg, timeout = 1000) => {
            let sessionID = "_" + Math.random()
            sendMsg(
                msg,
                this.owner,
                this.name,
                "normal",
                "request", // sessionState
                sessionID,
            )
            return makePromise( sessionID, timeout )
        }

        /**
         * 停掉子actor, 发送停止指令
         * @method kill
         */
        this.kill = () => {
            sendMsg(
                {},
                this.owner, //sender
                this.name, // receiver
                "kill", // channel
            )
        }
    }

    get name() {return this.getName()}
    get owner() {return this.getOwner()}
}
