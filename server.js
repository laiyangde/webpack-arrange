var express = require('express');
var webpack = require('webpack')
var webpackConfig = require('./webpack.config');
var compiler = webpack(webpackConfig);
var app = express();

// app.use(express.static('dist'))

app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
}));
app.use(require("webpack-hot-middleware")(compiler));
const server = app.listen(8080, function () {
  const host = server.address().address
  const port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})