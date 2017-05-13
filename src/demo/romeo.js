/**
 * 演示：
 * 使用Actor4JS，模仿mapreduce，统计罗密欧与朱丽叶全文使用最多的10个单词
 */

import ActorSys from "../System"

const sys = new ActorSys()
window.system = sys

// 定义 WordCount 类: 从所有统计数据中找到频率最高的词
sys.define("WordCount", {
    receive: _msg => {
        let msg = _msg.msg
        switch (msg.type) {
            case "text":
                console.log(self.name, "got text, wating for signal...")
                self.state.textFull = msg.textFull
                self.state.reducerRef = self.actorOf("Reducer", "reducer")
                return
            case "signal":
                self.state._msg = _msg // 用于返回信息
                console.log(self.name, "got signal, startCounting...")
                let promise = self.state.reducerRef.ask(self.state.textFull)
                promise.then(_msg => {
                    let arr = Object.entries(_msg.msg)
                    let result = arr.sort((a, b) => b[1] - a[1])
                    console.log(self.name, `
                        Calculation done.
                        There are ${result.length} different words.
                        The most frequently used word is ${result[0][0]},
                        which is used ${result[0][1]} times.
                        The full result: \n`, result)
                    self.state._msg.sender.tell(
                        result, self.state._msg.sessionID
                    )
                })
                return
            default:
                console.warn("unhandled msg")
        }
    },

    preStart: () => console.log(self.name, "I'm created.")
})

// 定义 Reducer 类: 从map统计的数据合并
sys.define("Reducer", {
    receive: _msg => {
        // 拿到全文
        let textFull = _msg.msg
        // 计算应该生成多少子actor来进行map计算
        let len = textFull.length
        let mapperCount = Math.ceil(len / 15000)
        console.log(self.name, "总长度", len, ", 将创建", mapperCount, "个mapper")
        // 保存计算结果
        self.state.result = {}
        self.state.promiseCount = mapperCount
        self.state.promiseFullfiled = 0
        self.state._msg = _msg // 用户返回计算结果
        // 创建子actor
        let i = mapperCount
        while (i--) {
            let aMapperRef = self.actorOf("Mapper", "mapper"+i)
            let seg = textFull.substring(i / mapperCount * len,
                                         (i + 1) / mapperCount * len)
            let promise = aMapperRef.ask(seg)
            // 收到计算结果之后
            replyHandler(promise)
        }

        // 处理mapper的回复
        function replyHandler(promise) {
            promise.then(
                _msg => {
                    // console.log("收到计算结果", _msg.msg)
                    reduce(self.state.result, _msg.msg)
                    self.state.promiseFullfiled ++
                    if (self.state.promiseFullfiled === self.state.promiseCount) {
                        // mapper全部返回
                        console.log(self.name, "FINISHED")
                        self.state._msg.sender.tell(self.state.result,
                                                    self.state._msg.sessionID)
                    }
                }
            ).catch(
                _msg => {
                    console.error(_msg, "计算失败, 重新计算")
                    promise = aMapperRef.ask(seg)
                    replyHandler(promise)
                }
            )
        }

        function reduce(result, addition) {
            Object.keys(addition).forEach(key => {
                if (result[key]) {
                    result[key] += addition[key]
                } else {
                    result[key] = addition[key]
                }
            })
        }
    },

    preStart: () => console.log(self.name, "I'm created.")
})

// 定义 Mapper 类: 统计一个片段的词数
sys.define("Mapper", {
    receive: _msg => {
        let seg = _msg.msg
        let words = seg.split(/\W+/)
        let result = {}
        words.forEach(word => {
            if (!word) { return }
            word = word.toLowerCase()
            if (result[word]) {
                result[word] ++
            } else {
                result[word] = 1
            }
        })
        // console.log(words)
        _msg.sender.tell(result, _msg.sessionID)
    },

    preStart: () => console.log(self.name, "I'm created.")
})


// 实例化 WordCount actor
let counterRef = sys.actorOf("WordCount", "counter")
// 文章
fetch("http://demos-meng.oss-cn-shanghai.aliyuncs.com/actor4js/RomeoAndJuliet.txt")
.then(res => res.text())
.then(str => {
    counterRef.tell({ type: "text", textFull: str })
    let promise = counterRef.ask({ type: "signal" })
    promise.then(_msg => {
        let result = _msg.msg
        result = result.slice(0, 100)
        let rootDom = document.getElementById("main")
        for (let i = 0; i < result.length; i++) {
            let tr = result[i]
            let html = `
                <td>${i+1}</td>
                <td>${tr[0]}</td>
                <td>${tr[1]}</td>
            `
            let trNode = document.createElement("tr")
            trNode.innerHTML = html
            rootDom.appendChild(trNode)
        }
    })
})
