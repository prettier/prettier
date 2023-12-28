import * as prettier from "../index.js";
import Context from "./context.js";
import logFileInfoOrDie from "./file-info.js";
import logResolvedConfigPathOrDie from "./find-config-path.js";
import { formatFiles, formatStdin } from "./format.js";
import createLogger from "./logger.js";
import { parseArgvWithoutPlugins } from "./options/parse-cli-arguments.js";
import printSupportInfo from "./print-support-info.js";
import { createDetailedUsage, createUsage } from "./usage.js";
import { printToScreen } from "./utils.js";

async function run(rawArguments = process.argv.slice(2)) {
  // Create a default level logger, so we can log errors during `logLevel` parsing
  let logger = createLogger();

  try {
    const { logLevel } = parseArgvWithoutPlugins(
      rawArguments,
      logger,
      "log-level",
    );
    if (logLevel !== logger.logLevel) {
      logger = createLogger(logLevel);
    }
    const context = new Context({ rawArguments, logger });
    await context.init();
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

  if (!context.argv.cache && context.argv.cacheStrategy) {
    throw new Error("`--cache-strategy` cannot be used without `--cache`.");
  }

  if (context.argv.version) {
    printToScreen(prettier.version);
    return;
  }

  if (context.argv.help !== undefined) {
    printToScreen(
      typeof context.argv.help === "string" && context.argv.help !== ""
        ? createDetailedUsage(context, context.argv.help)
        : createUsage(context),
    );
    return;
  }

  if (context.argv.supportInfo) {
    return printSupportInfo();
  }

  if (context.argv.findConfigPath) {
    await logResolvedConfigPathOrDie(context);
    return;
  }

  if (context.argv.fileInfo) {
    await logFileInfoOrDie(context);
    return;
  }

  const hasFilePatterns = context.filePatterns.length > 0;
  const useStdin =
    !hasFilePatterns && (!process.stdin.isTTY || context.argv.filepath);

  if (useStdin) {
    if (context.argv.cache) {
      throw new Error("`--cache` cannot be used when formatting stdin.");
    }

    await formatStdin(context);
    return;
  }

  if (hasFilePatterns) {
    await formatFiles(context);
    return;
  }

  process.exitCode = 1;
  printToScreen(createUsage(context));
}

export { run };
