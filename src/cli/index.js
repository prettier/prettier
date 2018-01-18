"use strict";

const chalk = require("chalk");

const prettier = require("../../index");
const Context = require("./context");
const constant = require("./constant");
const minimist = require("minimist");
const normalizer = require("../main/options-normalizer");

function run(args) {
  const rawArgv = minimist(args, constant.minimistOptions);

  const logger = createLogger(
    rawArgv["loglevel"] || constant.detailedOptionMap["loglevel"].default
  );

  try {
    const argv = normalizer.normalizeCliOptions(
      rawArgv,
      constant.detailedOptions,
      { logger }
    );

    const context = new Context(argv, logger);

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

function createLogger(logLevel) {
  return {
    warn: createLogFunc("warn", "yellow"),
    error: createLogFunc("error", "red"),
    debug: createLogFunc("debug", "blue"),
    log: createLogFunc("log")
  };

  function createLogFunc(loggerName, color) {
    if (!shouldLog(loggerName)) {
      return () => {};
    }

    const prefix = color ? `[${chalk[color](loggerName)}] ` : "";
    return function(message, opts) {
      opts = Object.assign({ newline: true }, opts);
      const stream = process[loggerName === "log" ? "stdout" : "stderr"];
      stream.write(message.replace(/^/gm, prefix) + (opts.newline ? "\n" : ""));
    };
  }

  function shouldLog(loggerName) {
    switch (logLevel) {
      case "silent":
        return false;
      default:
        return true;
      case "debug":
        if (loggerName === "debug") {
          return true;
        }
      // fall through
      case "log":
        if (loggerName === "log") {
          return true;
        }
      // fall through
      case "warn":
        if (loggerName === "warn") {
          return true;
        }
      // fall through
      case "error":
        return loggerName === "error";
    }
  }
}

module.exports = {
  run
};
