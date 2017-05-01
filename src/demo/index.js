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

import { glob } from "../decorators"

import Actor from "../Actor"
import Msg from "../Msg"

///////////////
// excamples //
///////////////

class Task0 extends Actor {
    receive(msg) {
        switch (msg.type) {
            case "add":
                console.log("#task0: I'm adding...", msg.data[0] + msg.data[1])
                // let c = 999999; let d = []; while (c--) { d.push(Math.random()) }
                break

            case "mult":
                console.log("#task0: I'm multing...", msg.data[0] * msg.data[1])
                break

            default:
                this.noMatch()
        }
    }
}

let task0 = new Task0()
window.task0 = task0
// let task00 = new Task0()

let str = task0.receive.toString()
// console.log(str)

const msg = new Msg("add", [3, 5])
let c = 1
while (c--) {
    task0.worker.postMessage(msg)
    task0.worker.postMessage(new Msg("mult", [3, 5]))
}
// task0.receive(msg)
