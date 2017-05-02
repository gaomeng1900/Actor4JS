/**
 * worker test
 */

import {createFromFunction, createFromURL, createFromFactory} from "../thread"


// const a = 123
// const worker0 = createWorker(() => {
//     let a = {}
//     // require("freelancer")
//     // const {Freelancer} = await import("freelancer")
//
//     postMessage("I am worker 0")
//     onmessage = (event) => {
//         postMessage("got " + event.data)
//         a = 234
//         // console.log(self)
//         // self.close()
//     }
//
//     console.log("a: ", a)
//     setInterval(()=>{
//         console.log("a: ", a)
//     }, 1000)
// })
//
// worker0.onmessage = (event) => {
//     console.log("worker said: ", event.data)
//     // console.log(worker0)
// }
//
// worker0.postMessage("abc")
// worker0.postMessage("123")
// window.w = worker0
// // setTimeout(()=>{worker0.terminate()}, 1000)
// // worker0.terminate()



// const worker1_creater = () => {
//     const W = require("worker-loader!./worker1.js")
//     console.log(W.toString());
//     return new W()
// }
// const worker1 = createFromFactory(worker1_creater)

// console.log(worker1);
//
// worker1.onmessage = (event) => {
//     console.log("worker said: ", event.data)
//     // console.log(worker1)
// }
//
// worker1.postMessage("abc")
// worker1.postMessage("123")
//
//
// function test3() {
//     console.log("this is test3");
// }
//
// let text4 = () => {
//     console.log("this is test4");
// }
//
// console.log(test3.toString());
// console.log(text4.toString());
//
// window.evalFunction

import ActorRef from "../ActorRef"

///////////////
// excamples //
///////////////

class Task0 extends ActorRef {
    receive(msg) {
        switch (msg.type) {
            case "add":
                console.log("#task0: adding...", msg.data[0] + msg.data[1])
                break

            case "mult":
                console.log("#task0: multing...", msg.data[0] * msg.data[1])
                break

            case 'spawn':
                let childActorId = this.spawn("Task0")
                if (msg.data < 3) {
                    this.msg("spawn", msg.data+1, childActorId).send()
                    this.msg("add", [3,9]).to(childActorId)
                } else {
                    let childActorId = this.spawn("Task1")
                    this.msg("sub", [3,9]).to(childActorId)
                    this.msg("subb", [3,9]).to(childActorId)
                }
                break

            default:
                this.noMatch()
        }
    }
}
Task0.register()

class Task1 extends ActorRef {
    receive(msg) {
        switch (msg.type) {
            case "sub":
                console.log("#task1: subing...", msg.data[0] - msg.data[1])
                break

            case "div":
                console.log("#task1: diving...", msg.data[0] / msg.data[1])
                break

            default:
                this.noMatch()
        }
    }
}
Task1.register()


let task0Ref = new Task0()
window.task0Ref = task0Ref

task0Ref.send('spawn', 0)


let c = 1
while (c--) {
    task0Ref.send("add", [3, 5])
    task0Ref.send("mult", [3, 5])
}
