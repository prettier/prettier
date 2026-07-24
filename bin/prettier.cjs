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
    minor: Number(parts[1]) || 0,
    patch: Number(parts[2]) || 0
  };
}

function isVersionSatisfies(version, required) {
  required = parseVersion(required);
  version = parseVersion(version);

  return (
    version.major > required.major ||
    (version.major === required.major && version.minor > required.minor) ||
    (version.major === required.major &&
      version.minor === required.minor &&
      version.patch >= required.patch)
  );
}

function shouldEnableExperimentalCli() {
  var index = process.argv.indexOf("--experimental-cli");

  if (index !== -1) {
    process.argv.splice(index, 1);
  }

  return index !== -1 || process.env.PRETTIER_EXPERIMENTAL_CLI;
}

var requiredVersion = require("../package.json").engines.node.replace(">=", "");

function run() {
  // Based on `please-upgrade-node` package
  if (!isVersionSatisfies(process.versions.node, requiredVersion)) {
    var message =
      "Prettier requires at least version " +
      requiredVersion +
      " of Node.js, please upgrade!";

    process.exitCode = 1;
    console.error(message);
    return Promise.reject(new Error(message));
  }

  var dynamicImport = new Function("module", "return import(module)");

  if (shouldEnableExperimentalCli()) {
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
