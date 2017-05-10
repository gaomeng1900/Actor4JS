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
        this.parent = this.env.makeActorRef(c.parent, c.name)
        this.children = []

        // 构造一个加的this传给用户编写的代码, 以隔离环境
        let me = this // 不转接一下的话下面的this会指向object, 导致循环
        this.safeContex = {
            get state()              {return me.state},
            set state(newState)      {me.state = newState},
            get parent()             {return me.parent},
            get children()           {return me.children},
            get actorOf()            {return me.actorOf.bind(me)},
            get supervisorStrategy() {return me.supervisorStrategy.bind(me)},
            get name()               {return me.name}
        }

        // 构造核心接口
        this.receive = new Function(
            "msg",
            `
            var self = this.safeContex;
            var me = this.safeContex;
            (${c.receive}).bind(this.safeContex)(msg);
            `
        )
        // 可选的接口
        if (c.preStart) {
            this.preStart = new Function(
                `
                var self = this.safeContex;
                var me = this.safeContex;
                (${c.preStart}).bind(this.safeContex)()
                `
            )
        }
        if (c.supervisorStrategy) {
            this.supervisorStrategy = new Function(
                "ecp",
                `
                var self = this.safeContex;
                var me = this.safeContex;
                (${c.supervisorStrategy}).bind(this.safeContex)(ecp)
                `
            )
        }
        // 运行初始化脚本
        this.preStart()
        // console.log(this);
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
     * @param  {String} className
     * @param  {String} actorName
     * @return {ActorRef}
     */
    actorOf(className, actorName) {
        this.env.sendMsg( // msg, sender, receiver, channel
            {className, actorName},
            this.name, "__sys__", "create_actor"
        )
        let ref = this.env.makeActorRef(actorName, this.name)
        this.children.push(ref)
        return ref
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
        // _msg = {
        //     msg: {
        //         type: ErrorType, // "MIA" <- missing in action, "dying" <- 即将停止
        //         message: e.message,
        //     }
        //     sender: _msg.receiver
        // }
        switch (_msg.msg.type) {
            case "stopped": // 子actor停止运转
                console.log("子组件停止", _msg.sender.name)
                break
            case "Error": // 子组件主动报错
                console.warn("子组件主动报错", _msg.sender.name, _msg.msg.message)
                break
            default: // js内置错误(不可控的程序错误)
                console.warn("程序不可控错误", _msg.sender.name, _msg.msg.stack)
                return
        }
    }

    /**
     * 停掉当前的actor
     * 递归地停掉所有的子actors
     * 向父actor发送监控指令
     * @method stop
     */
    stop() {
        // console.log(this.children)
        this.children.forEach(child => {
            child.kill()
        })
        let supervisorMsg = {
            type: "stopped",
            message: "stop method was called",
        }
        this.env.sendMsg( // msg, sender, receiver, channel
            supervisorMsg,
            this.name,
            this.parent.name,
            "supervisor",
        )
    }
}
