#!/usr/bin/env node

"use strict";

var nodeModule = require("module");

if (typeof nodeModule.enableCompileCache === "function") {
  nodeModule.enableCompileCache();
}

// https://unpkg.com/semver-compare@1.0.0/index.js
function semverCompare(a, b) {
  var pa = a.split(".");
  var pb = b.split(".");
  for (var i = 0; i < 3; i++) {
    var na = Number(pa[i]);
    var nb = Number(pb[i]);
    if (na > nb) {
      return 1;
    }
    if (nb > na) {
      return -1;
    }
    if (!Number.isNaN(na) && Number.isNaN(nb)) {
      return 1;
    }
    if (Number.isNaN(na) && !Number.isNaN(nb)) {
      return -1;
    }
  }
  return 0;
}

// https://unpkg.com/please-upgrade-node@3.2.0/index.js
function checkNodejsVersion() {
  var packageJson = require("../package.json");
  var requiredVersion = packageJson.engines.node.replace(">=", "");
  var currentVersion = process.version.slice(1);
  if (semverCompare(currentVersion, requiredVersion) === -1) {
    throw new Error(
      "Prettier requires at least version " +
        requiredVersion +
        " of Node.js, please upgrade!"
    );
  }
}

var dynamicImport = new Function("module", "return import(module)");

function run() {
  try {
    checkNodejsVersion();
  } catch (error) {
    process.exitCode = 1;
    // eslint-disable-next-line no-console
    console.error(error.message);
    return Promise.reject(error);
  }

  var index = process.argv.indexOf("--experimental-cli");
  if (process.env.PRETTIER_EXPERIMENTAL_CLI || index !== -1) {
    if (index !== -1) {
      process.argv.splice(index, 1);
    }

    return dynamicImport("../src/experimental-cli/index.js").then(
      function (cli) {
        return cli.__promise;
      }
    );
  }

  return dynamicImport("../src/cli/index.js").then(function runCli(cli) {
    return cli.run();
  });
}

// Exposed for test
module.exports.__promise = run();
