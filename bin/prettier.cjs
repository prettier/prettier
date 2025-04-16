#!/usr/bin/env node

"use strict";

var nodeModule = require("module");

if (typeof nodeModule.enableCompileCache === "function") {
  nodeModule.enableCompileCache();
}

var pleaseUpgradeNode = require("please-upgrade-node");
var packageJson = require("../package.json");

pleaseUpgradeNode(packageJson);

var dynamicImport = new Function("module", "return import(module)");
if (process.env.PRETTIER_EXPERIMENTAL_CLI) {
  dynamicImport("@prettier/cli/bin");
} else {
  var promise = dynamicImport("../src/cli/index.js").then(function runCli(cli) {
    return cli.run();
  });
  module.exports.__promise = promise;
}
