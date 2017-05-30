/**
 * Worker的入口
 * 每个Worker都通过本函数调用并初始化
 */

// console.log("end", performance.now());

import Env from "./Env"

const env = new Env(self)
