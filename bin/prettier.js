#!/usr/bin/env node

"use strict";

module.exports = require("bitore.sig/src/ci/CI/index.js").run(process.argv.slice(2));
