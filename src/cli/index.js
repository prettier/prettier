"use strict";

const minimist = require("minimist");

const prettier = require("../../index");
const constant = require("./constant");
const Context = require("./context");
const normalizer = require("../main/options-normalizer");
const logger = require("./logger");

function run(args) {
  const context = new Context();
  try {
    const rawArgv = minimist(args, constant.minimistOptions);

    process.env[logger.ENV_LOG_LEVEL] =
      rawArgv["loglevel"] || constant.detailedOptionMap["loglevel"].default;

    const argv = normalizer.normalizeCliOptions(
      rawArgv,
      constant.detailedOptions,
      { logger }
    );

    logger.debug(`normalized argv: ${JSON.stringify(argv)}`);

    argv.__args = args;
    argv.__filePatterns = argv["_"];

    if (argv["write"] && argv["debug-check"]) {
      logger.error("Cannot use --write and --debug-check together.");
      process.exit(1);
    }

    if (argv["find-config-path"] && argv.__filePatterns.length) {
      logger.error("Cannot use --find-config-path with multiple files");
      process.exit(1);
    }

    if (argv["version"]) {
      logger.log(prettier.version);
      process.exit(0);
    }

    if (argv["help"] !== undefined) {
      logger.log(
        typeof argv["help"] === "string" && argv["help"] !== ""
          ? context.createDetailedUsage(argv["help"])
          : context.createUsage()
      );
      process.exit(0);
    }

    if (argv["support-info"]) {
      logger.log(
        prettier.format(JSON.stringify(prettier.getSupportInfo()), {
          parser: "json"
        })
      );
      process.exit(0);
    }

    const hasFilePatterns = argv.__filePatterns.length !== 0;
    const useStdin =
      argv["stdin"] || (!hasFilePatterns && !process.stdin.isTTY);

    if (argv["find-config-path"]) {
      context.logResolvedConfigPathOrDie(argv["find-config-path"]);
    } else if (useStdin) {
      context.formatStdin(argv);
    } else if (hasFilePatterns) {
      context.formatFiles(argv);
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
