#!/usr/bin/env node

"use strict";

const cli = require("../src/cli");

function run() {
  cli.run(process.argv.slice(2));
}

module.exports = {
  run,
  mockable: cli.mockable
};

if (require.main === module) {
  run();
}
