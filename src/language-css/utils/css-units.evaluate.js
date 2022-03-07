"use strict";

const cssUnits = require("css-units-list");

const CSS_UNITS = Object.fromEntries(
  cssUnits.map((unit) => [unit.toLowerCase(), unit])
);

module.exports = CSS_UNITS;
