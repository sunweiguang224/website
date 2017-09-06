var webpack = require('webpack');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
// const vuxLoader = require('vux-loader');
import glob from 'glob';
import fs from 'fs';


module.exports = function (jsPath, staticPath) {
  let entry = {
    'static/common/js/autoRootSize': './src/common/js/autoRootSize.js',
  };

  // 自动添加src下的JS
  glob.sync(`${__dirname}/${jsPath}`).forEach(function (filePath) {
    let check = /src\/page\/(.*)\/js\/(.*)\.js/.exec(filePath);
    if (check[1] !== check[2]) return;
    // console.log(check)
    // console.log()
    // console.log(check[2])
    // console.log(filePath);
    // console.log(fs.existsSync(filePath));
    let result = /src[/](page[/].*).js/.exec(filePath);
    let dest = `static/${result[1]}`;
    let src = `./src/${result[1]}.js`;
    entry[dest] = src;
    // console.log(`${dest}: ${src}`);
  });

  var webpackConfig = {
    entry: entry,
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: staticPath.replace('dist/static', 'dist/'),
      // path:'dist',
    },
    module: {
      loaders: [
        {
          test: /\.scss$/,
          loader: 'style!css!sass'//?modules!postcss 添加对样式表的处理 postcss为CSS代码自动添加适应不同浏览器的CSS前缀。
        },
        {
          test: /\.es6$/,
          loader: "babel-loader?optional=runtime"
        },
        {test: /\.css$/, loader: "style-loader!css-loader?-autoprefixer"},
        {test: /\.vue$/, loader: 'vue'},
        {test: /\.json$/, loader: "json-loader", include: path.resolve(__dirname, "src")},
        {test: /\.js$/, loader: 'babel-loader', include: path.resolve(__dirname, "src")},
        {test: /\.(png|jpg|jpeg)$/, loader: "url-loader?limit=102400", include: path.resolve(__dirname, "src")}
      ]
    },
    babel: {
      presets: [
        "es2015",
        "stage-0",
        "stage-1",
        "stage-2",
        "stage-3",
      ]
    },
    plugins: [
      // new ExtractTextPlugin("[name].css"),
      // 将公共代码抽离出来合并为一个文件
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: "commons",
      //   filename: 'static/common/js/common.js',
      //   minChunks: 2
      // }),
    ],
    externals: {
      "jquery": "$",
      'Vue': true,
      'Swiper': true,
      "IScroll": true,
      'VueLazyload': true,
      'VueRouter': true,
      '$': true,
      'Vuex': true,
    },
    resolve: {
      extensions: ['', '.js', '.vue', '.json'],
      alias: {
        vue: __dirname + '/src/common/js/lib/vue/vue.min.js'
      }
    }
  };

  // return vuxLoader.merge(webpackConfig, {
  //   options: {},
  //   plugins: [
  //     {
  //       name: 'vux-ui'
  //     }
  //   ]
  // });

  return webpackConfig;
};
