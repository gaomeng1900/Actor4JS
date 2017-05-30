import ActorSys from "../System"

// 0. 系统初始化时间
setTimeout(function () {
    console.log("start", performance.now());
    console.time("系统初始化用时")
    const system = new ActorSys()
    console.timeEnd("系统初始化用时")
    window.system = system

    console.time("定义actor用时")
    system.define("A", {
        receive: msg => {
            if (msg.sessionID) {
                msg.sender.tell("got it! " + self.state.count, msg.sessionID)
            } else {console.log(`#${self.name}: got it!`, self.state.count)}
            self.state.count ++
            // aa = bb
        },

        preStart: () => {
            self.state = { count: 0 }
        }
    })
    console.timeEnd("定义actor用时")

    system.define("B", {
        receive: msg => {},
        preStart: () => {
            self.state = {}
            setTimeout(function () {
                console.time("从Actor创建子Actor+来回通讯用时")
                let a2 = self.actorOf("A", "a2")
                let p2 = a2.ask("_" + Math.random())
                p2.then(msg => console.timeEnd("从Actor创建子Actor+来回通讯用时"))
            }, 10);
            // let a3 = null
            setTimeout(function () {
                console.time("从Actor创建子ActorRef用时")
                self.state.a3 = self.actorOf("A", "a3")
                console.timeEnd("从Actor创建子ActorRef用时")
            }, 1000);
            setTimeout(function () {
                console.time("从Actor与子Actor来回通信用时")
                let promise3 = self.state.a3.ask("haha")
                promise3.then(msg => {
                    console.timeEnd("从Actor与子Actor来回通信用时")
                })
            }, 2000);
        }
    })

    console.time("在主线程中创建ActorRef用时")
    window.a0 = system.actorOf("A", "a0")
    console.timeEnd("在主线程中创建ActorRef用时")

    setTimeout(function () {
        console.time("从主线程到Actor的消息来回用时")
        window.promise0 = a0.ask("haha")
        promise0.then(msg => {
            console.timeEnd("从主线程到Actor的消息来回用时")
        })
    }, 1000);

    setTimeout(function () {
        console.time("从主线程创建Actor+来回通讯用时")
        window.a1 = system.actorOf("A", "a1")
        window.promise1 = a1.ask("haha")
        promise1.then(msg => {
            console.timeEnd("从主线程创建Actor+来回通讯用时")
        })
    }, 2000);

    setTimeout(function () {
        let b0 = system.actorOf("B", "b0")
    }, 3000);
}, 1000)

// setTimeout(() => {
//     console.time("msgTrans")
//     let promise0 = a0.ask("haha")
//     promise0.then(msg => {
//         console.log("#promise0", "success", msg)
//         console.timeEnd("msgTrans")
//     }).catch(msg => console.log("#promise0", "fail", msg))
// }, 1000)
