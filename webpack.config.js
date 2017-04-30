/**
 * Webpack位置文件
 * - 不区分发布环境/dev环境
 * @author Meng
 * @date 2016-07-14
 */

const webpack = require('webpack')
const path    = require('path')

module.exports = {
    // 如果这里不使用path.resolve会出现`wenpack`可以运行但是`node server`运行失败的情况,
    // 因为npm相对路径发生变化
    // @NOTE 使用绝对地址来避免潜在问题
    entry: {
        index: [path.resolve("./src/demo/index.js"), 'webpack-hot-middleware/client?reload=true'] // 热重载中间件
    },
    output: {
        path: path.resolve("./build"),
        publicPath: "/", // 为使内网可访问, 不指明host
        filename: "[name].js", // 存在多个入口是这里需要用变量 [name].js
    },
    resolve: {},
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.jade/,
                loader: 'pug-loader'
            }
        ]
    },
    devtool: "inline-source-map",
    watch: true,
    plugins: [
        new webpack.HotModuleReplacementPlugin(), // 热重载
        new webpack.NoEmitOnErrorsPlugin() // 出错时不发布
    ]
}
