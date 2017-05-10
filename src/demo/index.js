import ActorSys from "../System"

// console.time("initSys")
const system = new ActorSys()
window.system = system
// console.timeEnd("initSys")

console._a = 456

// console.time("define")
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
        let a1 = self.actorOf("A", msg.msg)
        let p = a1.ask("wahaha")
        p.then(msg => {
            console.log("got reply", msg)
        })
         .catch(e => console.warn(e))
        self.state.count ++
    },

    preStart: () => {
        self.state = { count: 0 }
    }
})
// console.timeEnd("define")

let a0 = system.actorOf("A", "a0")
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
// }, 1000)

let b0 = system.actorOf("B", "b0")
b0.tell("haha")
b0.tell("xixi")
// b0.tell("_1")

let c = 10
while (c--) {
    // b0.tell("hahaha")
    b0.tell(`_${c}`)
}

// setTimeout(() => b0.kill(), 1000)
// setTimeout(() => b0.tell("yoyo"), 1500)