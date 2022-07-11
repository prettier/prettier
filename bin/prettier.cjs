#!/usr/bin/env node

"use strict";

var pleaseUpgradeNode = require("please-upgrade-node");
var packageJson = require("../package.json");

pleaseUpgradeNode(packageJson);

function runCli(cli) {
  return cli.run(process.argv.slice(2));
}

var dynamicImport = new Function("module", "return import(module)");

module.exports.promise = dynamicImport("../src/cli/index.js").then(runCli);
