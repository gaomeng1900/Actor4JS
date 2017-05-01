// ref:
// - http://www.liuhaihua.cn/archives/115548.html


function glob (target) {
    let r = window || this
    r[target.name] = target
    target.__decotated = true
}


export {
    glob,
}
