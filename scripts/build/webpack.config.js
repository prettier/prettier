"use strict";

const path = require("path");

const externals = require("./externals");

module.exports = {
  entry: Object.assign(
    { index: "./index.js" },
    externals.reduce(
      (acc, external) =>
        Object.assign(acc, {
          [external.outName || external.name]: external.name
        }),
      {}
    )
  ),

  output: {
    path: path.join(__dirname, "../../dist"),
    library: "prettier",
    libraryTarget: "umd",
    filename: "[name].umd.js"
  },

  externals: [
    (context, request, callback) => {
      const external = externals.find(external => external.name === request);
      if (external) {
        return callback(null, "root " + external.outName || external.name);
      }

      callback();
    }
  ],

  node: {
    fs: "empty"
  },

  stats: {
    modules: false
  },

  mode: "production"
};
