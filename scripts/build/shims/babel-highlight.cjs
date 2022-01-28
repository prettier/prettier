"use strict";

const chalk = require("./chalk.cjs");
const highlight = { shouldHighlight: () => false, getChalk: () => chalk };

module.exports = highlight;
