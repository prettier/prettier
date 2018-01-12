"use strict";

const externals = require("./externals");

const alias = externals.reduce(
  (obj, external) =>
    Object.assign(obj, {
      [external.name]: `./externals/${external.outName || external.name}`
    }),
  {}
);

module.exports = {
  presets: [["env", { targets: { node: "4" } }]],
  plugins: [["module-resolver", { root: ["dist"], alias }]]
};
