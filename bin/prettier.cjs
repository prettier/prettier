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

var promise;
var index = process.argv.indexOf("--experimental-cli");
if (process.env.PRETTIER_EXPERIMENTAL_CLI || index !== -1) {
  if (index !== -1) {
    process.argv.splice(index, 1);
  }
  promise = dynamicImport("../src/experimental-cli/index.js").then(
    function (cli) {
      return cli.__promise;
    }
  );
} else {
  promise = dynamicImport("../src/cli/index.js").then(function runCli(cli) {
    return cli.run();
  });
}

// Exposed for test
module.exports.__promise = promise;
