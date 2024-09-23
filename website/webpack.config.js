"use strict";
const path = require("node:path");

module.exports = {
  entry: {
    playground: "./playground/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "static"),
  },
  module: {
    rules: [
      {
        test: /\.js$/u,
        exclude: /node_modules/u,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/react"],
        },
      },
    ],
  },
  externals: {
    clipboard: "ClipboardJS",
    codemirror: "CodeMirror",
    react: "React",
    "react-dom": "ReactDOM",
  },
};
