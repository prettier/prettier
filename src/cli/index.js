"use strict";

// eslint-disable-next-line no-restricted-modules
const packageJson = require("../../package.json");
require("please-upgrade-node")(packageJson);

// eslint-disable-next-line import/order
const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const core = require("./core");

async function run(rawArguments) {
  // Create a default level logger, so we can log errors during `logLevel` parsing
  let logger = core.createLogger();

  try {
    const logLevel = core.parseArgvWithoutPlugins(
      rawArguments,
      logger,
      "loglevel"
    ).loglevel;
    if (logLevel !== logger.logLevel) {
      logger = core.createLogger(logLevel);
    }

    await main(rawArguments, logger);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
}

async function main(rawArguments, logger) {
  const context = new core.Context({ rawArguments, logger });

  logger.debug(`normalized argv: ${JSON.stringify(context.argv)}`);

  if (context.argv.check && context.argv["list-different"]) {
    throw new Error("Cannot use --check and --list-different together.");
  }

  if (context.argv.write && context.argv["debug-check"]) {
    throw new Error("Cannot use --write and --debug-check together.");
  }

  if (context.argv["find-config-path"] && context.filePatterns.length > 0) {
    throw new Error("Cannot use --find-config-path with multiple files");
  }

  if (context.argv["file-info"] && context.filePatterns.length > 0) {
    throw new Error("Cannot use --file-info with multiple files");
  }

  if (context.argv.version) {
    logger.log(prettier.version);
    return;
  }

  if (context.argv.help !== undefined) {
    logger.log(
      typeof context.argv.help === "string" && context.argv.help !== ""
        ? core.createDetailedUsage(context, context.argv.help)
        : core.createUsage(context)
    );
    return;
  }

  if (context.argv["support-info"]) {
    logger.log(
      prettier.format(stringify(prettier.getSupportInfo()), {
        parser: "json",
      })
    );
    return;
  }

  const hasFilePatterns = context.filePatterns.length > 0;
  const useStdin =
    !hasFilePatterns &&
    (!process.stdin.isTTY || context.argv["stdin-filepath"]);

  if (context.argv["find-config-path"]) {
    await core.logResolvedConfigPathOrDie(context);
  } else if (context.argv["file-info"]) {
    await core.logFileInfoOrDie(context);
  } else if (useStdin) {
    await core.formatStdin(context);
  } else if (hasFilePatterns) {
    await core.formatFiles(context);
  } else {
    logger.log(core.createUsage(context));
    process.exitCode = 1;
  }
}

module.exports = {
  run,
};
