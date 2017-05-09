/**
 * Actor接口定义
 * 主线程/Worker线程的ActorCore和ActorRef都应该实现这个接口
 */

export default class Actor {
    constructor(character, env) {
        this.env = env // 该类的所有接口不可调用env以外命名域的对象
        let c = character

        if (!c.name) {throw new Error("lack of key:name")}
        if (!c.parent) {throw new Error("lack of key:parent")}
        if (!c.receive) {throw new Error("lack of key:receive")}

        this.name = c.name
        this.state = {}
        this.parent = parent
        this.children = []

        // 构造一个加的this传给用户编写的代码, 以隔离环境
        this.safeContex = {
            get state()              {return this.state},
            set state(newState)      {this.state = newState},
            get parent()             {return this.parent},
            get children()           {return this.children},
            get actorOf()            {return this.actorOf},
            get supervisorStrategy() {return this.supervisorStrategy},
            get name()               {return this.name}
        }

        // 构造核心接口
        this.receive = new Function(
            "msg",
            `(${c.receive}).bind(this.safeContex)(msg)`
        )
        // 可选的接口
        if (c.preStart) {
            this.preStart = new Function(
                `(${c.preStart}).bind(this.safeContex)`
            )
        }
        if (c.supervisorStrategy) {
            this.supervisorStrategy = new Function(
                "ecp",
                `(${c.supervisorStrategy}).bind(this.safeContex)(ecp)`
            )
        }
        // 运行初始化脚本
        this.preStart()
    }

    /**
     * 定义一个Actor时必须override这个接口
     * @ref 可以通过该接口查看源码
     * @core 用于接受所有正常信道的信息
     * @method receive
     */
    receive(msg, sender) {
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
    // tell(msg) {}

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
    // ask(msg, timeout) { // return new Promise() }

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
     * @废除: 一个actor只有一个parent
     */
    // watch(actorRef) {
        // 定期向actorRef.ask心跳检测
        // 同时向子actor注册监管者, 让子actor向自己发送监管信息
    // }

    /**
     * 该actor的监控信息需要发给谁
     * @ref 禁止调用
     * @core 调用环境层接口, 向ref发心跳
     * @method registerSupervisor
     * @param  {ActorRef} actorRef
     * @废除: 一个actor只有一个parent
     */
    // registerSupervisor(actorRef) {}

    /**
     * 轮询
     * 观察自己的父子actor是否正常运转
     * 每次轮询时衰减父子actor的生命体征
     * 同时向父子actor发心跳
     * 如果父actor失联, 则关闭自己
     * 如果子actor失联, 则调用supervisorStrategy处理
     * @method polling
     * @废除: 目前的actor不应该非自然死亡,
     */
    // polling() {}

    /**
     * 收到心跳, 恢复该actor的生命体征
     * @method heartbeat
     * @param  {[type]}  actorName
     * @return [type]
     * @废除: 目前的actor不应该非自然死亡,
     */
    // heartbeat(actorName) {}

    /**
     * 定义对子actor的监控策略
     * 收到子actor的监控信息之后应该如何处理
     * @TODO: 子组件都能发送哪些类型的exception
     * @TODO: 如何关闭或重启子组件
     * @method supervisorStrategy
     * @param  {Object}           exception
     */
    supervisorStrategy(_msg) {
        _msg = {
            msg: {
                type: ErrorType, // "MIA" <- missing in action, "dying" <- 即将停止
                message: e.message,
            }
            sender: _msg.receiver
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
