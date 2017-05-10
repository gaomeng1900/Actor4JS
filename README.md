# Actor4JS

## TODO
- [ ] 废弃的actor、promise的清理

---

- actor应该有自己的状态数据, 与其他actor隔离
- 不做持久化
- 很多actor共享一个线程，保证这个实现细节不影响处理actor状态的单线程性

- actorRef可以被无限制地传递
- ActorRef 最重要的目的是支持向它所代表的actor发送消息
    - 在给其它actor发送的消息中也缺省包含这个引用
    - actorRef应该是一个非常轻量的可序列化数据


- 首先需要实现的是一个 不区分actor所在位置的信息传递系统
- 监管只应该发生在父子actor之间
- 监管信息需要有单独的信道
    - 创建子actor
    - 父子actor之间的心跳检测
    - 错误传递
    - 对子actor的重启和关闭
        - 该操作对于子actor来说是递归的

- 创建Actor
    - system.actorOf()
    - this.actorOf()

- 死信应该只用于调试
- 投递是无保证的, 投递的顺序有保证但是投递成功与否是无保证的

- 不做become/unbecome

- 禁止在一个actor中声明另一个

- context暴露actor和当前消息的上下文信息，如：
    - 用于创建子actor的工厂方法（actorOf）
    - 父监管者
    - 所监管的子actor
    - 生命周期监控

- 只需要重写 receive 方法

- tell: Fire-forget
- ask: Send-And-Receive-Future
    - 立即返回一个promise

```javascript
targetRef.tell(msg)

let promise = targetRef.ask(msg, 1000)
promise.onSuccess = (msg) => {}
promise.onFailure = (error) => {}

// this.forward(msg)
```

- 监管方案的定义

```javascript
supervisorStrategy(exception) => {}
```

- 调度器
    - 如何在线程间调度actor
    - 暂时先不实现, 循环分配

- 由于Worker的设计, 邮箱机制是不需要考虑的

- actor应该可以当做状态机
    - 初始状态指定
    - access自身状态的接口

```javascript
initState(){
    this.state = {
        "callCount" : 0
    }
}
```

- actor之间的操作全部通过actorRef进行
- actor之间没有直接的调用关系, 全部走信息通信

- 信息的信道即信息类型
- 不同信道交给不同的程序处理

http://jasonqu.github.io/akka-doc-cn/2.3.6/scala/book/chapter3/01_actors.html
