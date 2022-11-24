"use strict";

const { default: cssUnits } = require("../../../vendors/css-units-list.json");

const CSS_UNITS = Object.fromEntries(
  cssUnits.map((unit) => [unit.toLowerCase(), unit])
);

module.exports = CSS_UNITS;
