"use strict";

const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");
const createLogger = require("./logger.js");
const Context = require("./context.js");
const { parseArgvWithoutPlugins } = require("./options/parse-cli-arguments.js");
const showUsage = require("./usage.js");
const { formatStdin, formatFiles } = require("./format.js");
const logFileInfoOrDie = require("./file-info.js");
const logResolvedConfigPathOrDie = require("./find-config-path.js");
const {
  utils: { isNonEmptyArray },
} = require("./prettier-internal.js");

async function run(rawArguments) {
  // Create a default level logger, so we can log errors during `logLevel` parsing
  let logger = createLogger();
  let logLevel;

  try {
    logLevel = parseArgvWithoutPlugins(
      rawArguments,
      logger,
      "loglevel"
    ).loglevel;
  } catch (error) {
    logger.error(error.message);
    return;
  }

  if (logLevel !== logger.logLevel) {
    logger = createLogger(logLevel);
  }

  await main(rawArguments, logger);
}
async function main(rawArguments, logger) {
  let context;

  try {
    context = new Context({ rawArguments, logger });
  } catch (error) {
    logger.error(error.message);
    return;
  }

  logger.debug(`normalized argv: ${JSON.stringify(context.argv)}`);

  if (context.argv.pluginSearch === false) {
    const rawPluginSearchDirs = context.argv.__raw["plugin-search-dir"];
    if (
      typeof rawPluginSearchDirs === "string" ||
      isNonEmptyArray(rawPluginSearchDirs)
    ) {
      logger.error(
        "Cannot use --no-plugin-search and --plugin-search-dir together."
      );
      return;
    }
  }

  if (context.argv.check && context.argv.listDifferent) {
    logger.error("Cannot use --check and --list-different together.");
    return;
  }

  if (context.argv.write && context.argv.debugCheck) {
    logger.error("Cannot use --write and --debug-check together.");
    return;
  }

  if (context.argv.findConfigPath && context.filePatterns.length > 0) {
    logger.error("Cannot use --find-config-path with multiple files");
    return;
  }

  if (context.argv.fileInfo && context.filePatterns.length > 0) {
    logger.error("Cannot use --file-info with multiple files");
    return;
  }

  if (context.argv.version) {
    logger.log(prettier.version);
    return;
  }

  if (context.argv.help !== undefined) {
    showUsage(context, context.argv.help);
    return;
  }

  if (context.argv.supportInfo) {
    logger.log(
      prettier.format(stringify(prettier.getSupportInfo()), {
        parser: "json",
      })
    );
    return;
  }

  const hasFilePatterns = context.filePatterns.length > 0;
  const useStdin =
    !hasFilePatterns && (!process.stdin.isTTY || context.argv.filePath);

  if (context.argv.findConfigPath) {
    await logResolvedConfigPathOrDie(context);
  } else if (context.argv.fileInfo) {
    await logFileInfoOrDie(context);
  } else if (useStdin) {
    await formatStdin(context);
  } else if (hasFilePatterns) {
    await formatFiles(context);
  } else {
    process.exitCode = 1;
    showUsage(context);
  }
}

module.exports = {
  run,
};
