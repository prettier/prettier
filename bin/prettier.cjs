#!/usr/bin/env node

"use strict";

var pleaseUpgradeNode = require("please-upgrade-node");
var packageJson = require("../package.json");

pleaseUpgradeNode(packageJson);

function runCli(cli) {
  return cli.run(process.argv.slice(2));
}

module.exports.promise = (function () {
  if (process.env.NODE_ENV !== "production") {
    var dynamicImport = new Function("module", "return import(module)");

    return dynamicImport("../src/cli/index.js").then(runCli);
  }

  var cli = require("../src/cli/index.js");

  return runCli(cli);
})();
