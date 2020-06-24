#!/usr/bin/env node

"use strict";

const importLocal = require("import-local");

if (!importLocal(__filename)) {
  require("./cli").run(process.argv.slice(2));
}
