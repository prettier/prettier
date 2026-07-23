#!/usr/bin/env node

"use strict";

var nodeModule = require("module");

if (typeof nodeModule.enableCompileCache === "function") {
  nodeModule.enableCompileCache();
}

function parseVersion(version) {
  var parts = version.split(".", 3);
  return {
    major: Number(parts[0]),
    minor: parts.length > 1 ? Number(parts[1]) : 0,
    patch: parts.length > 2 ? Number(parts[2]) : 0
  };
}

var dynamicImport = new Function("module", "return import(module)");

function run() {
  // Based on `please-upgrade-node` package
  var packageJson = require("../package.json");
  var requiredVersion = packageJson.engines.node.replace(">=", "");
  var currentVersion = process.version.slice(1);
  var parsedRequiredVersion = parseVersion(requiredVersion);
  var parsedCurrentVersion = parseVersion(currentVersion);

  if (!(
    parsedCurrentVersion.major > parsedRequiredVersion.major ||
    (parsedCurrentVersion.major === parsedRequiredVersion.major &&
      parsedCurrentVersion.minor > parsedRequiredVersion.minor) ||
    (parsedCurrentVersion.major === parsedRequiredVersion.major &&
      parsedCurrentVersion.minor === parsedRequiredVersion.minor &&
      parsedCurrentVersion.patch >= parsedRequiredVersion.patch)
  )) {
    var message =
      "Prettier requires at least version " +
      requiredVersion +
      " of Node.js, please upgrade!";

    process.exitCode = 1;
    // eslint-disable-next-line no-console
    console.error(message);
    return Promise.reject(new Error(message));
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
