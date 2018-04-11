"use strict";

const webpack = require('webpack')

module.exports = {
  entry: {
    playground: './playground/index.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/static/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    ]
  }
}
