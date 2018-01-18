"use strict";

const prettier = require("../../index");
const Context = require("./context");
const logger = require("./logger");

function run(args) {
  try {
    const context = new Context(args);

    logger.debug(`normalized argv: ${JSON.stringify(context.argv)}`);

    context.argv.__args = args;
    context.argv.__filePatterns = context.argv["_"];

    if (context.argv["write"] && context.argv["debug-check"]) {
      logger.error("Cannot use --write and --debug-check together.");
      process.exit(1);
    }

    if (
      context.argv["find-config-path"] &&
      context.argv.__filePatterns.length
    ) {
      logger.error("Cannot use --find-config-path with multiple files");
      process.exit(1);
    }

    if (context.argv["version"]) {
      logger.log(prettier.version);
      process.exit(0);
    }

    if (context.argv["help"] !== undefined) {
      logger.log(
        typeof context.argv["help"] === "string" && context.argv["help"] !== ""
          ? context.createDetailedUsage(context.argv["help"])
          : context.createUsage()
      );
      process.exit(0);
    }

    if (context.argv["support-info"]) {
      logger.log(
        prettier.format(JSON.stringify(prettier.getSupportInfo()), {
          parser: "json"
        })
      );
      process.exit(0);
    }

    const hasFilePatterns = context.argv.__filePatterns.length !== 0;
    const useStdin =
      context.argv["stdin"] || (!hasFilePatterns && !process.stdin.isTTY);

    if (context.argv["find-config-path"]) {
      context.logResolvedConfigPathOrDie(context.argv["find-config-path"]);
    } else if (useStdin) {
      context.formatStdin();
    } else if (hasFilePatterns) {
      context.formatFiles();
    } else {
      logger.log(context.createUsage());
      process.exit(1);
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  run
};
