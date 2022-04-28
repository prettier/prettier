"use strict";

const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");
const createLogger = require("./logger.js");
const Context = require("./context.js");
const { parseArgvWithoutPlugins } = require("./options/parse-cli-arguments.js");
const { createDetailedUsage, createUsage } = require("./usage.js");
const { formatStdin, formatFiles } = require("./format.js");
const logFileInfoOrDie = require("./file-info.js");
const logResolvedConfigPathOrDie = require("./find-config-path.js");
const {
  utils: { isNonEmptyArray },
} = require("./prettier-internal.js");
const { printToScreen } = require("./utils.js");

async function run(rawArguments) {
  // Create a default level logger, so we can log errors during `logLevel` parsing
  let logger = createLogger();

  try {
    const logLevel = parseArgvWithoutPlugins(
      rawArguments,
      logger,
      "loglevel"
    ).loglevel;
    if (logLevel !== logger.logLevel) {
      logger = createLogger(logLevel);
    }
    const context = new Context({ rawArguments, logger });
    if (logger.logLevel !== "debug" && context.performanceTestFlag) {
      context.logger = createLogger("debug");
    }

    await main(context);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
}

async function main(context) {
  context.logger.debug(`normalized argv: ${JSON.stringify(context.argv)}`);

  if (context.argv.pluginSearch === false) {
    const rawPluginSearchDirs = context.argv.__raw["plugin-search-dir"];
    if (
      typeof rawPluginSearchDirs === "string" ||
      isNonEmptyArray(rawPluginSearchDirs)
    ) {
      throw new Error(
        "Cannot use --no-plugin-search and --plugin-search-dir together."
      );
    }
  }

  if (context.argv.check && context.argv.listDifferent) {
    throw new Error("Cannot use --check and --list-different together.");
  }

  if (context.argv.write && context.argv.debugCheck) {
    throw new Error("Cannot use --write and --debug-check together.");
  }

  if (context.argv.findConfigPath && context.filePatterns.length > 0) {
    throw new Error("Cannot use --find-config-path with multiple files");
  }

  if (context.argv.fileInfo && context.filePatterns.length > 0) {
    throw new Error("Cannot use --file-info with multiple files");
  }

  if (context.argv.version) {
    printToScreen(prettier.version);
    return;
  }

  if (context.argv.help !== undefined) {
    printToScreen(
      typeof context.argv.help === "string" && context.argv.help !== ""
        ? createDetailedUsage(context, context.argv.help)
        : createUsage(context)
    );
    return;
  }

  if (context.argv.supportInfo) {
    printToScreen(
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
    printToScreen(createUsage(context));
  }
}

module.exports = {
  run,
};
