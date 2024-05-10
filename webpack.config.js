"use strict";

const path = require("path");
const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DotenvWebpack = require('dotenv-webpack');

module.exports = {
  mode: "development",
  entry: "./src/js/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 8080,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new DotenvWebpack()
  ],
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: "style-loader",
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: "css-loader",
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [autoprefixer],
              },
            },
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: "sass-loader",
          },
        ],
      },
      {
        // 问题:默认处理不了html中img图片
        // 处理图片资源
        test: /\.(jpg|png|gif)/,
        // 使用一个loader时,直接写就行了
        loader: "url-loader",
        options: {
          // 图片大小小于8KB,就会被base64处理
          // 优点:减少请求数量(减轻服务器压力)
          // 缺点:图片体积会增大, 就会导致文件请求速度更慢
          limit: 8 * 1024,
          // 问题: 因为url-loader默认使用es6模块化解析,
          // 而html-loader引入图片commonjs
          // 解析时会出问题: [object Module]
          // 解决: 关闭url-loader的es6模块化, 使用commonjs解析
          esModule: false,
          // 给图片进行重命名
          // [hash:10]取图片的hash的前10位
          // [ext]去文件原来扩展名
          name: "[hash:10].[ext]",
        },
      },
      {
        test: /\.html$/,
        // 处理html文件的img图片 (负责引入img, 从而能被url-loader进行处理)
        loader: "html-loader",
      },
    ],
  },
};
