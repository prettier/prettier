import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { createTwoFilesPatch } from "diff";
import * as prettier from "../index.js";
import {
  createIsIgnoredFunction,
  errors,
  mockable,
} from "./prettier-internal.js";
import { expandPatterns } from "./expand-patterns.js";
import getOptionsForFile from "./options/get-options-for-file.js";
import isTTY from "./is-tty.js";
import findCacheFile from "./find-cache-file.js";
import FormatResultsCache from "./format-results-cache.js";
import { statSafe, normalizeToPosix } from "./utils.js";

const { getStdin, writeFormattedFile } = mockable;

function diff(a, b) {
  return createTwoFilesPatch("", "", a, b, "", "", { context: 2 });
}

class DebugError extends Error {
  name = "DebugError";
}

function handleError(context, filename, error, printedFilename, ignoreUnknown) {
  ignoreUnknown ||= context.argv.ignoreUnknown;

  const errorIsUndefinedParseError =
    error instanceof errors.UndefinedParserError;

  if (printedFilename) {
    // Can't test on CI, `isTTY()` is always false, see ./is-tty.js
    /* c8 ignore next 3 */
    if ((context.argv.write || ignoreUnknown) && errorIsUndefinedParseError) {
      printedFilename.clear();
    } else {
      // Add newline to split errors from filename line.
      process.stdout.write("\n");
    }
  }

  if (errorIsUndefinedParseError) {
    if (ignoreUnknown) {
      return;
    }
    if (!context.argv.check && !context.argv.listDifferent) {
      process.exitCode = 2;
    }
    context.logger.error(error.message);
    return;
  }

  const isParseError = Boolean(error?.loc);
  const isValidationError = /^Invalid \S+ value\./.test(error?.message);

  if (isParseError) {
    // `invalid.js: SyntaxError: Unexpected token (1:1)`.
    context.logger.error(`${filename}: ${String(error)}`);
  } else if (isValidationError || error instanceof errors.ConfigError) {
    // `Invalid printWidth value. Expected an integer, but received 0.5.`
    context.logger.error(error.message);
    // If validation fails for one file, it will fail for all of them.
    process.exit(1);
  } else if (error instanceof DebugError) {
    // `invalid.js: Some debug error message`
    context.logger.error(`${filename}: ${error.message}`);
  } else {
    // `invalid.js: Error: Some unexpected error\n[stack trace]`
    /* c8 ignore next */
    context.logger.error(filename + ": " + (error.stack || error));
  }

  // Don't exit the process if one file failed
  process.exitCode = 2;
}

function writeOutput(context, result, options) {
  // Don't use `console.log` here since it adds an extra newline at the end.
  process.stdout.write(
    context.argv.debugCheck ? result.filepath : result.formatted,
  );

  if (options && options.cursorOffset >= 0) {
    process.stderr.write(result.cursorOffset + "\n");
  }
}

async function listDifferent(context, input, options, filename) {
  if (!context.argv.check && !context.argv.listDifferent) {
    return;
  }

  try {
    if (!(await prettier.check(input, options)) && !context.argv.write) {
      context.logger.log(filename);
      process.exitCode = 1;
    }
  } catch (error) {
    context.logger.error(error.message);
  }

  return true;
}

async function format(context, input, opt) {
  if (context.argv.debugPrintDoc) {
    const doc = await prettier.__debug.printToDoc(input, opt);
    return { formatted: (await prettier.__debug.formatDoc(doc)) + "\n" };
  }

  if (context.argv.debugPrintComments) {
    return {
      formatted: await prettier.format(
        JSON.stringify(
          (await prettier.formatWithCursor(input, opt)).comments || [],
        ),
        { parser: "json" },
      ),
    };
  }

  if (context.argv.debugPrintAst) {
    const { ast } = await prettier.__debug.parse(input, opt);
    return {
      formatted: JSON.stringify(ast),
    };
  }

  if (context.argv.debugCheck) {
    const pp = await prettier.format(input, opt);
    const pppp = await prettier.format(pp, opt);
    if (pp !== pppp) {
      throw new DebugError(
        "prettier(input) !== prettier(prettier(input))\n" + diff(pp, pppp),
      );
    } else {
      const stringify = (obj) => JSON.stringify(obj, null, 2);
      const ast = stringify(
        (await prettier.__debug.parse(input, opt, { massage: true })).ast,
      );
      const past = stringify(
        (await prettier.__debug.parse(pp, opt, { massage: true })).ast,
      );

      /* c8 ignore start */
      if (ast !== past) {
        const MAX_AST_SIZE = 2097152; // 2MB
        const astDiff =
          ast.length > MAX_AST_SIZE || past.length > MAX_AST_SIZE
            ? "AST diff too large to render"
            : diff(ast, past);
        throw new DebugError(
          "ast(input) !== ast(prettier(input))\n" +
            astDiff +
            "\n" +
            diff(input, pp),
        );
      }
      /* c8 ignore end */
    }
    return { formatted: pp, filepath: opt.filepath || "(stdin)\n" };
  }

  const { performanceTestFlag } = context;
  if (performanceTestFlag?.debugBenchmark) {
    let benchmark;
    try {
      // eslint-disable-next-line import/no-extraneous-dependencies
      ({ default: benchmark } = await import("benchmark"));
    } catch {
      context.logger.debug(
        "'--debug-benchmark' requires the 'benchmark' package to be installed.",
      );
      process.exit(2);
    }
    context.logger.debug(
      "'--debug-benchmark' option found, measuring formatWithCursor with 'benchmark' module.",
    );
    const suite = new benchmark.Suite();
    suite.add("format", {
      defer: true,
      async fn(deferred) {
        await prettier.formatWithCursor(input, opt);
        deferred.resolve();
      },
    });
    const result = await new Promise((resolve) => {
      suite
        .on("complete", (event) => {
          resolve({
            benchmark: String(event.target),
            hz: event.target.hz,
            ms: event.target.times.cycle * 1000,
          });
        })
        .run({ async: false });
    });
    context.logger.debug(
      "'--debug-benchmark' measurements for formatWithCursor: " +
        JSON.stringify(result, null, 2),
    );
  } else if (performanceTestFlag?.debugRepeat) {
    const repeat = performanceTestFlag.debugRepeat;
    context.logger.debug(
      `'${performanceTestFlag.name}' found, running formatWithCursor ${repeat} times.`,
    );
    let totalMs = 0;
    for (let i = 0; i < repeat; ++i) {
      // should be using `performance.now()`, but only `Date` is cross-platform enough
      const startMs = Date.now();
      await prettier.formatWithCursor(input, opt);
      totalMs += Date.now() - startMs;
    }
    const averageMs = totalMs / repeat;
    const results = {
      repeat,
      hz: 1000 / averageMs,
      ms: averageMs,
    };
    context.logger.debug(
      `'${
        performanceTestFlag.name
      }' measurements for formatWithCursor: ${JSON.stringify(
        results,
        null,
        2,
      )}`,
    );
  }

  return prettier.formatWithCursor(input, opt);
}

async function createIsIgnoredFromContextOrDie(context) {
  try {
    return await createIsIgnoredFunction(
      context.argv.ignorePath,
      context.argv.withNodeModules,
    );
  } catch (e) {
    context.logger.error(e.message);
    process.exit(2);
  }
}

async function formatStdin(context) {
  const { filepath } = context.argv;

  try {
    const input = await getStdin();
    // TODO[@fisker]: Exit if no input.
    // `prettier --config-precedence cli-override`

    let isFileIgnored = false;
    if (filepath) {
      const isIgnored = await createIsIgnoredFromContextOrDie(context);
      isFileIgnored = isIgnored(filepath);
    }

    if (isFileIgnored) {
      writeOutput(context, { formatted: input });
      return;
    }

    const options = await getOptionsForFile(
      context,
      filepath ? path.resolve(filepath) : undefined,
    );

    if (await listDifferent(context, input, options, "(stdin)")) {
      return;
    }

    const formatted = await format(context, input, options);

    const { performanceTestFlag } = context;
    if (performanceTestFlag) {
      context.logger.log(
        `'${performanceTestFlag.name}' option found, skipped print code to screen.`,
      );
      return;
    }

    writeOutput(context, formatted, options);
  } catch (error) {
    handleError(context, filepath || "stdin", error);
  }
}

async function formatFiles(context) {
  // This will be used to filter file paths after the glob is checked,
  // before any files are actually written
  const isIgnored = await createIsIgnoredFromContextOrDie(context);
  const cwd = process.cwd();

  let numberOfUnformattedFilesFound = 0;
  const { performanceTestFlag } = context;

  if (context.argv.check && !performanceTestFlag) {
    context.logger.log("Checking formatting...");
  }

  let formatResultsCache;
  const cacheFilePath = await findCacheFile(context.argv.cacheLocation);
  if (context.argv.cache) {
    formatResultsCache = new FormatResultsCache(
      cacheFilePath,
      context.argv.cacheStrategy || "content",
    );
  } else if (!context.argv.cacheLocation) {
    const stat = await statSafe(cacheFilePath);
    if (stat) {
      await fs.unlink(cacheFilePath);
    }
  }

  for await (const { error, filename, ignoreUnknown } of expandPatterns(
    context,
  )) {
    if (error) {
      context.logger.error(error);
      // Don't exit, but set the exit code to 2
      process.exitCode = 2;
      continue;
    }

    const isFileIgnored = isIgnored(filename);
    if (
      isFileIgnored &&
      (context.argv.debugCheck ||
        context.argv.write ||
        context.argv.check ||
        context.argv.listDifferent)
    ) {
      continue;
    }

    const options = {
      ...(await getOptionsForFile(context, filename)),
      filepath: filename,
    };

    const fileNameToDisplay = normalizeToPosix(path.relative(cwd, filename));
    let printedFilename;
    if (isTTY()) {
      printedFilename = context.logger.log(fileNameToDisplay, {
        newline: false,
        clearable: true,
      });
    }

    let input;
    try {
      input = await fs.readFile(filename, "utf8");
    } catch (error) {
      // Add newline to split errors from filename line.
      /* c8 ignore start */
      context.logger.log("");

      context.logger.error(
        `Unable to read file "${fileNameToDisplay}":\n${error.message}`,
      );

      // Don't exit the process if one file failed
      process.exitCode = 2;

      continue;
      /* c8 ignore stop */
    }

    if (isFileIgnored) {
      printedFilename?.clear();
      writeOutput(context, { formatted: input }, options);
      continue;
    }

    const start = Date.now();

    const isCacheExists = formatResultsCache?.existsAvailableFormatResultsCache(
      filename,
      options,
    );

    let result;
    let output;

    try {
      if (isCacheExists) {
        result = { formatted: input };
      } else {
        result = await format(context, input, options);
      }
      output = result.formatted;
    } catch (error) {
      handleError(
        context,
        fileNameToDisplay,
        error,
        printedFilename,
        ignoreUnknown,
      );
      continue;
    }

    const isDifferent = output !== input;
    let shouldSetCache = !isDifferent;

    // Remove previously printed filename to log it with duration.
    printedFilename?.clear();

    if (performanceTestFlag) {
      context.logger.log(
        `'${performanceTestFlag.name}' option found, skipped print code or write files.`,
      );
      return;
    }

    if (context.argv.write) {
      // Don't write the file if it won't change in order not to invalidate
      // mtime based caches.
      if (isDifferent) {
        if (!context.argv.check && !context.argv.listDifferent) {
          context.logger.log(`${fileNameToDisplay} ${Date.now() - start}ms`);
        }

        try {
          await writeFormattedFile(filename, output);

          // Set cache if format succeeds
          shouldSetCache = true;
        } catch (error) {
          context.logger.error(
            `Unable to write file "${fileNameToDisplay}":\n${error.message}`,
          );

          // Don't exit the process if one file failed
          process.exitCode = 2;
        }
      } else if (!context.argv.check && !context.argv.listDifferent) {
        const message = `${chalk.grey(fileNameToDisplay)} ${
          Date.now() - start
        }ms (unchanged)`;
        if (isCacheExists) {
          context.logger.log(`${message} (cached)`);
        } else {
          context.logger.log(message);
        }
      }
    } else if (context.argv.debugCheck) {
      if (result.filepath) {
        context.logger.log(fileNameToDisplay);
      } else {
        /* c8 ignore next */
        process.exitCode = 2;
      }
    } else if (!context.argv.check && !context.argv.listDifferent) {
      writeOutput(context, result, options);
    }

    if (shouldSetCache) {
      formatResultsCache?.setFormatResultsCache(filename, options);
    } else {
      formatResultsCache?.removeFormatResultsCache(filename);
    }

    if (isDifferent) {
      if (context.argv.check) {
        context.logger.warn(fileNameToDisplay);
      } else if (context.argv.listDifferent) {
        context.logger.log(fileNameToDisplay);
      }
      numberOfUnformattedFilesFound += 1;
    }
  }

  formatResultsCache?.reconcile();

  // Print check summary based on expected exit code
  if (context.argv.check) {
    if (numberOfUnformattedFilesFound === 0) {
      context.logger.log("All matched files use Prettier code style!");
    } else {
      const files =
        numberOfUnformattedFilesFound === 1
          ? "the above file"
          : `${numberOfUnformattedFilesFound} files`;
      context.logger.warn(
        context.argv.write
          ? `Code style issues fixed in ${files}.`
          : `Code style issues found in ${files}. Run Prettier to fix.`,
      );
    }
  }

  // Ensure non-zero exitCode when using --check/list-different is not combined with --write
  if (
    (context.argv.check || context.argv.listDifferent) &&
    numberOfUnformattedFilesFound > 0 &&
    !process.exitCode &&
    !context.argv.write
  ) {
    process.exitCode = 1;
  }
}

export { formatStdin, formatFiles };
