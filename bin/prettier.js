#!/usr/bin/env node

"use strict";

var pleaseUpgradeNode = require("please-upgrade-node");
var packageJson = require("../package.json");

pleaseUpgradeNode(packageJson);

var cli = require("../src/cli/index.js");

module.exports = cli.run(process.argv.slice(2));
