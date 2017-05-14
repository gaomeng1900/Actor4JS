# Actor4JS 文档

## 使用
```javascript
// 引入系统
import ActorSys from "./System"
// 实例化系统
const system = new ActorSys()

// 定义Actor类的行为
system.define("A", {
    // 必需: 信息接收行为
    receive: _msg => {
        let msg = _msg.msg
        // 模式匹配
        switch (msg.type) {
            case "pattern_0":
                // 创建子Actor
                self.actorOf("A", "a1")
                return
            case "pattern_1"
                console.log(msg)
                return
            default:
                console.error("unhandled msg")
        }
    },

    // 可选: 钩子函数
    preStart: () => { self.state = { count: 0 } },
    // 可选: 子Actor监管策略
    supervisorStrategy: exception => { /*do some thing*/ },
})

// 创建Actor
let a0Ref = system.actorOf("A", "a0")
// 发送带回执的消息
let promise = a0Ref.ask({type: "pattern_1", data: "hello world"})
promise.then(_msg => console.log("got", _msg.msg))
       .catch(exception => console.warn("timeout", _msg))
// 发送无回执的消息
a0Ref.tell({type: "pattern_1", data: "hello world"})
// 停止子Actor(递归的停止Actor树上该节点的所有子Actor)
a0Ref.kill()
```

## API

### ActorSys

```javascript
/**
 * ActorSystem
 * 单例模式对象
 * @param {Object} conf 配置线程池数量, default: {pool:5}
 */
class ActorSys {

    /**
     * 注册一个 actor Class
     * 这里不使用 Class extends, 兼容性不好而且还是要单独register
     * 只有注册过的actorClass才能创建
     * @method define
     * @param  {String} className
     * @param  {Object} actorClass
     * @return {String} className
     */
    define(className, character) {}

    /**
     * 创建actor, 以sys为父
     * 由用户直接调用
     * @method actorOf
     * @param  {String} className
     * @param  {String} actorName
     * @return {ActorRef}
     */
    actorOf(className, actorName) {}

    // 调试工具
    // 打印整个Actor树
    print() {}
}
```

### ActorRef

```javascript
/**
 * 对另一个actor进行远程调用的唯一接口
 */

class ActorRef {
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
    tell(msg, sessionID) { }

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
    ask(msg, timeout = 1000) { }

    /**
     * 停掉子actor, 发送停止指令
     * @method kill
     */
    kill() { }
}

```

### ActorCharacter对象

```javascript
{
    // 必需: 信息接收行为
    receive: function(_msg) {},
    // 可选: 钩子函数
    preStart: function() {},
    // 可选: 子Actor监管策略
    supervisorStrategy: function (exception) {},
}
```

### msg对象

```javascript
{
    channel: "normal", // 信道, 根据信道分配处理方法与转发策略
    sessionID: "_0.123", // 回话ID, 回复需要回执的消息时需要带上这个
    msg: {}, // 用户定义的消息正文
}
```

### exception对象

<!-- TODO -->

### 性能说明

<!-- TODO -->

### 安全说明

<!-- TODO -->

### 对子Actor的监管方案

<!-- TODO -->
