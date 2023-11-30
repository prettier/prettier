#!/usr/bin/env node

"use strict";

var pleaseUpgradeNode = require("please-upgrade-node");
var packageJson = require("../package.json");

pleaseUpgradeNode(packageJson);

function runCli(cli) {
  return cli.run();
}

var dynamicImport = new Function("module", "return import(module)");
var promise = dynamicImport("../node_modules/@prettier/next/dist/bin.js").then(runCli);

// Exported for test
module.exports.__promise = promise;
