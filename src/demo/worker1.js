postMessage("I am worker 1")
onmessage = (event) => {
    postMessage("worker1 got " + event.data)
}
