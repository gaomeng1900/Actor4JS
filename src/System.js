/**
 * ActorSystem
 * 单例对象
 */

const G =  self

class ActorSys {
    constructor() {
        // 单例
    }

    /**
     * 注册一个 actor Class
     * 这里不使用 Class extends, 兼容性不好而且还是要单独register
     * 只有注册过的actorClass才能创建
     * @method define
     * @param  {String} className  [description]
     * @param  {Object} actorClass [description]
     * @return {String} className
     */
    define(className, actorClass) {}

    /**
     * actor之间(以及和root之间)转发信息
     * 所有的msg都需要经过这里, 在这里隐藏掉线程之间的区别
     * @method forward
     * @param  {[type]} a
     * @param  {[type]} b
     * @param  {[type]} msg
     */
    forward(a, b, msg) {}

    
}

G.__ACTOR_SYS__ || (G.__ACTOR_SYS__ = new ActorSys())
const ACTOR_SYS = G.__ACTOR_SYS__
export default ACTOR_SYS
