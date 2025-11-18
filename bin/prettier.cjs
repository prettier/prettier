#!/usr/bin/env node

"use strict";

var nodeModule = require("module");
if (typeof nodeModule.enableCompileCache === "function") {
  nodeModule.enableCompileCache();
}

var pleaseUpgradeNode = require("please-upgrade-node");
var packageJson = require("../package.json");
pleaseUpgradeNode(packageJson);

var shouldRunLegacyCli = !process.env.PRETTIER_EXPERIMENTAL_CLI;
var index = process.argv.indexOf("--legacy-cli");
if (index !== -1) {
  process.argv.splice(index, 1);
  shouldRunLegacyCli = true;
}

var dynamicImport = new Function("module", "return import(module)");
var promise;
if (shouldRunLegacyCli) {
  promise = dynamicImport("../src/cli/index.js").then(function runCli(cli) {
    return cli.run();
  });
} else {
  promise = dynamicImport("../src/experimental-cli/index.js").then(
    function (cli) {
      return cli.__promise;
    }
  );
}

// Exposed for test
module.exports.__promise = promise;
