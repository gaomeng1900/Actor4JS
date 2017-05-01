export default class ActorCloned {
    constructor(_actor) {
        this.cloned = true
        this.id = _actor.id

        this.receive = new Function("msg", `(${_actor.receive}).bind(this)(msg)`)
    }

    noMatch() {
        console.warn("noMatch")
    }
}
