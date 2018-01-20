"use strict";

const prettier = require("../../index");
const Context = require("./context");
const stringify = require("json-stable-stringify");

function run(args) {
  const context = new Context(args);

  try {
    context.init();

    context.logger.debug(`normalized argv: ${JSON.stringify(context.argv)}`);

    if (context.argv["write"] && context.argv["debug-check"]) {
      context.logger.error("Cannot use --write and --debug-check together.");
      process.exit(1);
    }

    if (context.argv["find-config-path"] && context.filePatterns.length) {
      context.logger.error("Cannot use --find-config-path with multiple files");
      process.exit(1);
    }

    if (context.argv["version"]) {
      context.logger.log(prettier.version);
      process.exit(0);
    }

    if (context.argv["help"] !== undefined) {
      context.logger.log(
        typeof context.argv["help"] === "string" && context.argv["help"] !== ""
          ? context.createDetailedUsage(context.argv["help"])
          : context.createUsage()
      );
      process.exit(0);
    }

    if (context.argv["support-info"]) {
      context.logger.log(
        prettier.format(stringify(prettier.getSupportInfo()), {
          parser: "json"
        })
      );
      process.exit(0);
    }

    const hasFilePatterns = context.filePatterns.length !== 0;
    const useStdin =
      context.argv["stdin"] || (!hasFilePatterns && !process.stdin.isTTY);

    if (context.argv["find-config-path"]) {
      context.logResolvedConfigPathOrDie(context.argv["find-config-path"]);
    } else if (useStdin) {
      context.formatStdin();
    } else if (hasFilePatterns) {
      context.formatFiles();
    } else {
      context.logger.log(context.createUsage());
      process.exit(1);
    }
  } catch (error) {
    context.logger.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  run
};
