/**
 * 对另一个actor进行远程调用的唯一接口
 */

export default class ActorRef {
    constructor(name, owner, makePromise) {
        this.name = name
        this.owner = owner
        // NOTE: 可能导致this指向问题
        this.makePromise = makePromise
    }

    /**
     * 向这个actor发送信息
     * 投递是不被保证的
     * 由于没有人能直接拿到某个actor的引用, 该接口只有ActorRef需要实现的
     * @ref 调用环境层接口, 讲msg送入通信层
     * @core 禁止调用
     * @method tell
     * @param  {*} msg
     */
    tell(msg) {}

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
    ask(msg, timeout) {
        return this.makePromise(
            "_" + Math.random(),
            timeout
        )
    }
}
