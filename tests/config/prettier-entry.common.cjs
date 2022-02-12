"use strict";

// This file exists because plugins for test use `require('prettier-local')`

const path = require("path");

module.exports = require(path.join(process.env.PRETTIER_DIR, "index.js"));
