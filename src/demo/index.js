import ActorSys from "../System"

const system = new ActorSys()
window.system = system

system.define("A", {
    receive: msg => {
        msg.sender.tell("got it! " + self.state.count, msg.sessionID)
        self.state.count ++
    },

    preStart: () => {
        console.log("#A#: I am an A!")

        self.state = { count: 0 }
    }
})

let a0 = system.actorOf("A", "a0")
console.log(a0);
let promise0 = a0.ask("haha")
let promise1 = a0.ask("haha")
promise0.then(msg => console.log("#promise0", "success", msg))
        .catch(msg => console.log("#promise0", "fail", msg))
promise1.then(msg => console.log("#promise0", "success", msg))
        .catch(msg => console.log("#promise0", "fail", msg))
