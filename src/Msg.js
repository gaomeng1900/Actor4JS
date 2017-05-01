import uuid from "uuid"

export default class Msg {
    constructor(type, data) {
        this.type = type
        this.data = data
        this.id = uuid()

        this.birthTime = new Date().getTime()

        this.target
        this.sender
    }
}
