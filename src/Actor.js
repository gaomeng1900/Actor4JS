/**
 * Actor接口定义
 * 主线程/Worker线程的ActorCore和ActorRef都应该实现这个接口
 */

export default class Actor {
    constructor(env) {
        this.env = env // 该类的所有接口不可调用env以外命名域的对象
    }

    /**
     * 定义一个Actor时必须override这个接口
     * @ref 可以通过该接口查看源码
     * @core 用于接受所有正常信道的信息
     * @method receive
     */
    receive() {
        // this <- 当前的actor上下文, 仅能访问指定的几个接口和状态(bind({}))
        // this.state <- 可以直接访问的自身状态
        // this.actorOf() <- 创建子actor
    }

    /**
     * 初始化自身状态, actor启动的时候会运行这个method
     * actor的state不做持久化
     * 唯一的钩子函数
     * @ref 可以通过该接口查看源码
     * @core 每次创建时运行
     * @method preStart
     * @return [type]    [description]
     */
    preStart() {
        this.state = {}
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
        // return new Promise()
    }

    /**
     * 创建子actor
     * @ref 禁止调用
     * @core 调用环境层接口, 讲创建指令送入通信层
     * @method actorOf
     * @param  {String} actorClass
     * @param  {String} actorName
     * @return {ActorRef}
     */
    actorOf(actorClass, actorName) {
        // return new ActorRef()
    }

    /**
     * 监控子actor
     * @ref 禁止调用
     * @core 调用环境层接口, 向ref发心跳
     * @method watch
     * @param  {ActorRef} actorRef
     */
    watch(actorRef) {
        // 定期向actorRef.ask心跳检测
        // 同时向子actor注册监管者, 让子actor向自己发送监管信息
    }

    /**
     * 该actor的监控信息需要发给谁
     * @ref 禁止调用
     * @core 调用环境层接口, 向ref发心跳
     * @method registerSupervisor
     * @param  {ActorRef} actorRef
     */
    registerSupervisor(actorRef) {}

    /**
     * 定义对子actor的监控策略
     * 收到子actor的监控信息之后应该如何处理
     * @method supervisorStrategy
     * @param  {Object}           exception
     */
    supervisorStrategy(exception) {
        exception = {
            type: ErrorType, // "MIA" <- missing in action, "dying" <- 即将停止
            sender: actorRef
        }
    }

    /**
     * 停掉当前的actor
     * 递归地停掉所有的子actors
     * @method stop
     * @return [type] [description]
     */
    stop() {}
}
