import uuid from "uuid"

export default class Msg {
    constructor(type, data, target, sender) {
        this.type = type
        this.data = data
        this.id = uuid()

        this.birthTime = new Date().getTime()

        this.target = target
        this.sender = sender
    }

    send() {
        const G = self
        let postMessage = G.postMessage
        if (G.document) {
            postMessage = (msg) => {
                G.__ACTOR_SYS__.send(msg)
            }
        }
        console.log(G, postMessage);

        if (this.target) {
            postMessage(new Msg("__transpond__", this))
        } else {
            console.warn("no target")
        }
    }

    to(target) {
        if (typeof target === "string") {
            this.target = target
        } else {
            this.target = target.id || console.error("cant find id of the target")
        }
        this.send()
    }
}
