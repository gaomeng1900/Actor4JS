import ActorSys from "../System"

// 1. 系统初始化时间
// console.log("start", performance.now());
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
    receive: msg => {
        setTimeout(`
            console.log(self)
        `, 1000)
        let layer = msg.msg
        if (layer > 5) {
            let a1 = self.actorOf("A", "a" + msg.msg)
            let p = a1.ask("_" + Math.random())
            p.then(msg => console.log("got reply", msg))
             .catch(e => console.warn(e))

        } else {
            let b = self.actorOf("B", "b"+layer)
            b.tell(layer+1)
        }
        self.state.count ++
        self.state.flag = !self.state.flag
    },

    preStart: () => {
        self.state = { count: 0, flag: true }
    }
})


// let a0 = system.actorOf("A", "a0")
// a0.tell("hello")
// a0.tell("hello")
// a0.tell("hello")
// console.time("WorkerInitAndMsgTrans")
// let promise0 = a0.ask("haha")
// // let promise1 = a0.ask("haha")
// promise0.then(msg => {
//     console.log("#promise0", "success", msg)
//     console.timeEnd("WorkerInitAndMsgTrans")
// }).catch(msg => console.log("#promise0", "fail", msg))
// // promise1.then(msg => console.log("#promise0", "success", msg))
//         // .catch(msg => console.log("#promise0", "fail", msg))

// setTimeout(() => {
//     console.time("msgTrans")
//     let promise0 = a0.ask("haha")
//     promise0.then(msg => {
//         console.log("#promise0", "success", msg)
//         console.timeEnd("msgTrans")
//     }).catch(msg => console.log("#promise0", "fail", msg))
// }, 1000)    if (Object.keys(node).length === 0) {return}

console.time("主线程中创建Actor用时")
let b0 = system.actorOf("B", "b0")
console.timeEnd("主线程中创建Actor用时")
// b0.tell("haha")
// b0.tell("xixi")
// b0.tell("_1")
b0.tell(1)

// let c = 10
// while (c--) {
//     // b0.tell("hahaha")
//     b0.tell(`_${c}`)
// }

setTimeout(() => {
    // b0.restart()
    b0.kill()
    // b0.tell(10)
}, 1000)
setTimeout(() => {
    // b0.restart()
    b0.tell(10)
}, 2000)
// setTimeout(() => b0.tell("yoyo"), 1500)
