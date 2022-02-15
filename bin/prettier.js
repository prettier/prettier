#!/usr/bin/env node

"use strict";

var cli = require("../src/cli/index.js");

module.exports = cli.run(process.argv.slice(2));
