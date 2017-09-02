"use strict";

const minimist = require("minimist");

const prettier = eval("require")("../index");
const constant = require("./cli-constant");
const util = require("./cli-util");

function run(args) {
  const argv = minimist(args, constant.options);
  argv.__args = args;

  if (argv["version"]) {
    console.log(prettier.version);
    process.exit(0);
  }

  const filepatterns = argv["_"];
  const stdin = argv["stdin"] || (!filepatterns.length && !process.stdin.isTTY);

  if (argv["write"] && argv["debug-check"]) {
    console.error("Cannot use --write and --debug-check together.");
    process.exit(1);
  }

  if (argv["find-config-path"] && filepatterns.length) {
    console.error("Cannot use --find-config-path with multiple files");
    process.exit(1);
  }

  if (
    argv["help"] ||
    (!filepatterns.length && !stdin && !argv["find-config-path"])
  ) {
    console.log(constant.usage);
    process.exit(argv["help"] ? 0 : 1);
  }

  if (argv["find-config-path"]) {
    util.resolveConfig(argv["find-config-path"]);
  } else if (stdin) {
    util.formatStdin(argv);
  } else {
    util.formatFiles(argv, filepatterns);
  }
}

module.exports = {
  run
};
