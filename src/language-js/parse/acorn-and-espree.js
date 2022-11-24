"use strict";

const acorn = require("./acorn.js");
const espree = require("./espree.js");

module.exports = {
  parsers: {
    acorn,
    espree,
  },
};
