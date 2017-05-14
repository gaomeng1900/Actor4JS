import ActorSys from "../System"

console.time("initSys")
const system = new ActorSys()
window.system = system
console.timeEnd("initSys")

console.time("define")
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
system.define("B", {
    receive: msg => {
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
console.timeEnd("define")

let a0 = system.actorOf("A", "a0")
console.time("WorkerInitAndMsgTrans")
let promise0 = a0.ask("haha")
let promise1 = a0.ask("haha")
promise0.then(msg => {
    console.log("#promise0", "success", msg)
    console.timeEnd("WorkerInitAndMsgTrans")
}).catch(msg => console.log("#promise0", "fail", msg))
promise1.then(msg => console.log("#promise0", "success", msg))
        .catch(msg => console.log("#promise0", "fail", msg))

setTimeout(() => {
    console.time("msgTrans")
    let promise0 = a0.ask("haha")
    promise0.then(msg => {
        console.log("#promise0", "success", msg)
        console.timeEnd("msgTrans")
    }).catch(msg => console.log("#promise0", "fail", msg))
}, 1000)    if (Object.keys(node).length === 0) {return}