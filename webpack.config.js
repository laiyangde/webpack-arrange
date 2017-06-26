var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

//客户端怎样连接中间件
//你可以使用像'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'这样的完整路径，
//这在你使用第三方服务如django、php时时非常有用的
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
module.exports = {
    context: path.resolve(__dirname, 'app'), //从这里寻找入口js
    entry: { //脚本文件入口
        entry1: ['./js/entry1.js',hotMiddlewareScript],//webpack-hot-middleware/client连接到服务器，以便打包或者重新编译时收到通知
        entry2: ['./js/entry2.js',hotMiddlewareScript]
    },
    output: { //脚本文件出口
        filename: '[name].bundle.js', //出口文件名
        path: path.resolve(__dirname, 'dist'), //导出目录
        chunkFilename: "[id].js", //非入口js名   require.ensure异步加载时才会用到
        publicPath: '' // 设置为想要的资源访问路径,如果没有设置，则默认从站点根目录加载。
    },
    // watch: true,
    resolve: { //http://www.css88.com/doc/webpack2/configuration/resolve/
        alias: { //创建 import 或 require 的别名，来确保模块引入变得更简单
            app: path.resolve(__dirname, 'app') //import add from 'app/m1';
        },
        extensions: [".js", ".json", ".css"],//自动解析确定的扩展
        modules: ["node_modules"],//此为默认值，告诉 webpack 解析模块时应该搜索的目录。按数组顺序搜索
    },
    module: {
        rules: [{ //es6 转 es2015
            test: /\.js$/,
            exclude: [/node_modules/], // 排除node模块
            use: [{
                loader: 'babel-loader',
                options: { presets: ['es2015'] },
            }],
        }, { //加载css
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader", //{String}/{Object}
                // publicPath:'',//修改加载器的publicPath
                use: [{
                        loader: 'css-loader',
                        options: { //参考https://github.com/webpack-contrib/css-loader
                            root: '/', //默认为/  url(/image.png) => url(/image.png)
                            importLoaders: 1, //在 css-loader 前应用的 loader 的数,而一个use数组里的loader是从后往前应用的
                            modules: false, //启用/禁用 css-modules 模式
                        }
                    },
                    'postcss-loader' //可以当做一个css处理的平台，平台上有各种插件，比如autoprefixer加前缀 ，此选项需要配置postcss.config.js
                ]
            })
        }, { //加载图片  
            //此插件可以进行图片压缩https://github.com/tcoopman/image-webpack-loader
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192 //单位b 图片小于这个数值转换为base64
                }
            }]
        }, { //加载字体
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                'file-loader'
            ]
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor'],
            // minchunks:2//模块调用超过2次时webpack才会把它当做一个公共模块抽取出来
        }),
        new HtmlWebpackPlugin({
            title: '标题',
            filename: 'index.html', //生成的html存放路径，相对于 path
            template: './index.tpl.html', //模板可以html jade handlebars 有的要配合相应的加载器，比如html要html-loader
            inject: true, //  true | 'head' | 'body' | false  脚本资源注入到body（body or true）底部还是head（head）里，还是不注入（false）
            // favicon:'./src/img/favicon.ico', //favicon路径
            minify: { //压缩HTML文件,其它属性看https://github.com/kangax/html-minifier#options-quick-reference
                removeComments: false, //移除HTML中的注释
                collapseWhitespace: false, //删除空白符与换行符
                minifyCSS: false, //压缩style里的css
                minifyJS: false, //压缩script里的js
                removeEmptyAttributes: false //是否删除空的属性
            },
            hash: true, //将添加一个唯一的 webpack 编译 hash 到所有包含的脚本和 CSS 文件，对于解除 cache 很有用。
            showErrors: true | false, // 如果为 true, 这是默认值，错误信息会写入到 HTML 页面中
            chunks: '', //允许只添加某些块,值为数组并且和output.filename里的[name]值相同，值为字符串则不起作用
            chunksSortMode: 'auto', //允许控制块在添加到页面之前的排序方式，支持的值：'none' | 'auto' | function  默认'auto'
            excludeChunks: 'none' //允许跳过某些块，值为数组和output.filename里的[name]值相同，值为字符串则不起作用
        }),
        new ExtractTextPlugin({
            filename: '[name].css?[contenthash]', //提取的css文件名
            //向所有额外的 chunk 提取（默认只提取初始加载模块）当使用CommonsChunkPlugin插件，有额外的chunks在commonchunk,allChunks必须为true
            allChunks: true,
            disable: false, //是否禁用插件                            
            ignoreOrder: false //是否禁用顺序检查，对 CSS Modules 有用!
        }),
        new webpack.HotModuleReplacementPlugin(),// 开启全局的模块热替换(HMR)
        new webpack.NoEmitOnErrorsPlugin()//在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
    ]
};

/**************************************************************************************************
entry  共四种形式
	string形式  entry: './index.js'    一个入口打包成一个js文件
	array形式   entry: ['./index.js','./index2.js']     多个入口打包成一个js文件
	object形式  像下面这样做就可以打包成： dist/home.bundle.js 、 dist/events.bundle.js 、 dist/end.bundle.js 
					entry: {home: "./home.js",events: "./events.js",end: ["./end.js","./end2.js"]},
					output: {path.resolve(__dirname, 'dist'),filename: "[name].bundle.js",}
	函数形式    entry: () => './demo'
				entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))

output {
	filename: 'bundle.js', 出口文件名
	path: path.resolve(__dirname, 'dist'), 导出目录
	library:'myClassName',
	sourceMapFilename:'[hash].map',   sourceMap文件名
	chunkFilename: "[id].js",  非入口js名   require.ensure异步加载时才会用到
	libraryTarget:'var'  什么形式
	publicPath:'/'  设置为想要的资源访问路径,如果没有设置，则默认从站点根目录加载。
	...其它属性暂不理解

	其中library 的导出格式
		"var" - 导出为一个变量：var Library = xxx（默认）
		"this" - 导出为 this 的一个属性：this["Library"] = xxx
		"commonjs" - 导出为 exports 的一个属性：exports["Library"] = xxx
		"commonjs2" - 通过 module.exports：module.exports = xxx 导出
		"amd" - 导出为 AMD（可选命名 - 通过 library 选项设置名称）
		"umd" - 导出为 AMD，CommonJS2 或者导出为 root 的属性

	publicPath示例：
		publicPath: "https://cdn.example.com/assets/", // CDN (always HTTPS)
		publicPath: "//cdn.example.com/assets/", // CDN (same protocol)
		publicPath: "/assets/", // server-relative
		publicPath: "assets/", // relative to HTML page
		publicPath: "../assets/", // relative to HTML page
		publicPath: "", // relative to HTML page (same directory)
}

**************************************************************************************************/

/*
	插件部分
 */

/**************************************************************************************************
=================
HtmlWebpackPlugin 
简化HTML文件的创建
=================
生成多个html则多次调用实例即可，如下：（或使用https://github.com/mutualofomaha/multipage-webpack-plugin插件）
plugins: [
    new HtmlWebpackPlugin(), // Generates default index.html 
    new HtmlWebpackPlugin({  // Also generate a test.html 
      filename: 'test.html',
      template: 'src/assets/test.html'
    })
]

如果inject还不能满足要求，可以用html-webpack-template project的默认模板作为启动点
参考地址如下：https://github.com/jaketrent/html-webpack-template/tree/86f285d5c790a6c15263f5cc50fd666d51f974fd
下列这些变量可以用在模板中： 
	1.htmlWebpackPlugin:这个插件的特定数据 
	2.htmlWebpackPlugin.files 它包含一个从入口点名称映射到包的文件名 
	如果你在webpack 配置文件中设置了publicPath。htmlWebpackPlugin.files将会正确映射到 资源散列。 
	3.htmlWebpackPlugin.options：传给插件的 配置项。除了插件本身使用这个些配置项以外，你也可以在模板中使用这些配置项。 
	4.webpack：webpack的统计对象。注意：这是stats对象，因为它是在HTML模板时发出，因此wepback运行完成后可能没有完整的数据集可用。 
	5.webpackConfig：插件编译用的webpack 配置项。例如它可以用来获取publicPath （webpackConfig.output.publicPath）。

在模板里引入代码片段，参考https://github.com/jantimon/html-webpack-plugin/tree/master/examples/custom-template
 <%= require('html-loader!./header.html') %>

=================
ExtractTextPlugin 
提取css写进独立样式文件中 
=================
参考:http://www.css88.com/doc/webpack2/plugins/extract-text-webpack-plugin/
	 https://github.com/webpack-contrib/extract-text-webpack-plugin
注意：ExtractTextPlugin 对每个入口 chunk 都生成对应的一个文件,所以当你配置多个入口 chunk 的时候，你必须使用 [name], [id] or [contenthash]
多个实例：http://www.css88.com/doc/webpack2/plugins/extract-text-webpack-plugin/


=================
CommonsChunkPlugin 
多个入口时提取 chunk 的公共模块
=================


=================
webpack-dev-middleware
与
webpack-hot-middleware  
实现浏览器的无刷新更新
=================

webpack-dev-middleware
是一个处理静态资源的中间件，此静态资源保存在内存中，不写入硬盘，正常情况下express访问静态文件需要app.use(express.static('dist'))
webpack-hot-middleware
建立websoket服务，当有文件更新时以便客户端处理。

client:
    1.在plugins里添加
    plugins: [
        new webpack.HotModuleReplacementPlugin(),// 开启全局的模块热替换(HMR)
        new webpack.NoEmitOnErrorsPlugin()//在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
    ]
    2.在entry每个入口添加：'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false&reload=true'
        path：中间件为事件流服务的路径，个人理解websoket服务url
        timeout：失去连接后等待多久后重连
        overlay： Set to false to disable the DOM-based client-side overlay. 设置为false禁用基于dom的客户端覆盖
        reload：webpack“卡住”时是否自动刷新页面，比如更新js时（默认只更新css），如果更改js需要热更新，请在入口文件中添加以下代码
                if (module.hot) {
                  module.hot.accept();//用于js的无刷新更新
                  module.hot.dispose(function() {
                    //更新前处理回调
                    //比如说有定时器清除掉时使用
                  });
                }
server:
    1. 添加webpack-dev-middleware
        var express = require('express');
        var webpack = require('webpack');
        var webpackConfig = require('./webpack.config');
        var compiler = webpack(webpackConfig);
        app.use(require("webpack-dev-middleware")(compiler, {
            noInfo: true, publicPath: webpackConfig.output.publicPath
        }));
    2.添加附带相同示例compiler的webpack-hot-middleware
        app.use(require("webpack-hot-middleware")(compiler));
    3.监听端口
        const server = app.listen(8080, function () {
          const host = server.address().address
          const port = server.address().port
          console.log("应用实例，访问地址为 http://%s:%s", host, port)
        })

详细查看server.js


**************************************************************************************************/
