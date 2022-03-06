"use strict";

const cssUnits = require("css-units-list");

const CSS_UNITS = new Map(cssUnits.map((unit) => [unit.toLowerCase(), unit]));

module.exports = {
  CSS_UNITS,
};
