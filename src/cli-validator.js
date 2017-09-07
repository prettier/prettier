"use strict";

function validateArgv(argv) {
  if (argv["write"] && argv["debug-check"]) {
    console.error("Cannot use --write and --debug-check together.");
    process.exit(1);
  }

  if (argv["find-config-path"] && argv.__filePatterns.length) {
    console.error("Cannot use --find-config-path with multiple files");
    process.exit(1);
  }
}

module.exports = {
  validateArgv
};
