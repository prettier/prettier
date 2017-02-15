#!/usr/bin/env node

"use strict";

const fs = require("fs");
const getStdin = require("get-stdin");
const glob = require("glob");
const chalk = require("chalk");
const minimist = require("minimist");
const readline = require("readline");
const prettier = require("../index");

const argv = minimist(process.argv.slice(2), {
  boolean: [
    "write",
    "stdin",
    "single-quote",
    "trailing-comma",
    "bracket-spacing",
    "jsx-bracket-same-line",
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    "color",
    "help",
    "version",
    "debug-print-doc",
    "debug-check",
    // Deprecated in 0.0.10
    "flow-parser"
  ],
  string: ["print-width", "tab-width", "parser"],
  default: { color: true, "bracket-spacing": true, parser: "babylon" },
  alias: { help: "h", version: "v" },
  unknown: param => {
    if (param.startsWith("-")) {
      console.warn("Ignored unknown option: " + param + "\n");
      return false;
    }
  }
});

if (argv["version"]) {
  console.log(prettier.version);
  process.exit(0);
}

const filepatterns = argv["_"];
const write = argv["write"];
const stdin = argv["stdin"] || !filepatterns.length && !process.stdin.isTTY;

if (argv["help"] || !filepatterns.length && !stdin) {
  console.log(
    "Usage: prettier [opts] [filename ...]\n\n" +
      "Available options:\n" +
      "  --write                  Edit the file in-place. (Beware!)\n" +
      "  --stdin                  Read input from stdin.\n" +
      "  --print-width <int>      Specify the length of line that the printer will wrap on. Defaults to 80.\n" +
      "  --tab-width <int>        Specify the number of spaces per indentation-level. Defaults to 2.\n" +
      "  --single-quote           Use single quotes instead of double.\n" +
      "  --trailing-comma         Print trailing commas wherever possible.\n" +
      "  --bracket-spacing        Put spaces between brackets. Defaults to true.\n" +
      "  --jsx-bracket-same-line  Put > on the last line. Defaults to false.\n" +
      "  --parser <flow|babylon>  Specify which parse to use. Defaults to babylon.\n" +
      "  --color                  Colorize error messages. Defaults to true.\n" +
      "  --version                Print prettier version.\n" +
      "\n" +
      "Boolean options can be turned off like this:\n" +
      "  --no-bracket-spacing\n" +
      "  --bracket-spacing=false"
  );
  process.exit(argv["help"] ? 0 : 1);
}

function getParserOption() {
  const optionName = "parser";
  const value = argv[optionName];

  if (value === undefined) {
    return value;
  }

  // For backward compatibility. Deprecated in 0.0.10
  if (argv["flow-parser"]) {
    console.warn("`--flow-parser` is deprecated. Use `--parser flow` instead.");
    return "flow";
  }

  if (value === "flow" || value === "babylon") {
    return value;
  }

  console.warn(
    "Ignoring unknown --" +
      optionName +
      ' value, falling back to "babylon":\n' +
      '  Expected "flow" or "babylon", but received: ' +
      JSON.stringify(value)
  );

  return "babylon";
}

function getIntOption(optionName) {
  const value = argv[optionName];

  if (value === undefined) {
    return value;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  console.error(
    "Invalid --" +
      optionName +
      " value. Expected an integer, but received: " +
      JSON.stringify(value)
  );
  process.exit(1);
}

const options = {
  printWidth: getIntOption("print-width"),
  tabWidth: getIntOption("tab-width"),
  bracketSpacing: argv["bracket-spacing"],
  parser: getParserOption(),
  singleQuote: argv["single-quote"],
  trailingComma: argv["trailing-comma"],
  jsxBracketSameLine: argv["jsx-bracket-same-line"]
};

function format(input) {
  if (argv["debug-print-doc"]) {
    const doc = prettier.__debug.printToDoc(input, options);
    return prettier.__debug.formatDoc(doc);
  }

  if (argv["debug-check"]) {
    const pp = prettier.format(input, options);
    const pppp = prettier.format(pp, options);
    if (pp !== pppp) {
      const diff = require(
        "diff"
      ).createTwoFilesPatch("", "", pp, pppp, "", "", { context: 2 });
      console.error(diff);
    }
    return;
  }

  return prettier.format(input, options);
}

function handleError(filename, e) {
  const isParseError = Boolean(e && e.loc);
  const isValidationError = /Validation Error/.test(e && e.message);

  // For parse errors and validation errors, we only want to show the error
  // message formatted in a nice way. `String(e)` takes care of that. Other
  // (unexpected) errors are passed as-is as a separate argument to
  // `console.error`. That includes the stack trace (if any), and shows a nice
  // `util.inspect` of throws things that aren't `Error` objects. (The Flow
  // parser has mistakenly thrown arrays sometimes.)
  if (isParseError) {
    console.error(filename + ": " + String(e));
  } else if (isValidationError) {
    console.error(String(e));
    // If validation fails for one file, it will fail for all of them.
    process.exit(1);
  } else {
    console.error(filename + ":", e);
  }

  // Don't exit the process if one file failed
  process.exitCode = 2;
}

if (stdin) {
  getStdin().then(input => {
    try {
      // Don't use `console.log` here since it adds an extra newline at the end.
      process.stdout.write(format(input));
    } catch (e) {
      handleError("stdin", e);
      return;
    }
  });
} else {
  eachFilename(filepatterns, filename => {
    fs.readFile(filename, "utf8", (err, input) => {
      if (write || argv["debug-check"]) {
        // Don't use `console.log` here since we need to replace this line.
        process.stdout.write(filename);
      }

      if (err) {
        // Add newline to split errors from filename line.
        process.stdout.write("\n");

        console.error("Unable to read file: " + filename + "\n" + err);
        // Don't exit the process if one file failed
        process.exitCode = 2;
        return;
      }

      const start = Date.now();

      let output;

      try {
        output = format(input);
      } catch (e) {
        // Add newline to split errors from filename line.
        process.stdout.write("\n");

        handleError(filename, e);
        return;
      }

      if (write) {
        // Remove previously printed filename to log it with duration.
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, null);

        // Don't write the file if it won't change in order not to invalidate
        // mtime based caches.
        if (output === input) {
          console.log(chalk.grey("%s %dms"), filename, Date.now() - start);
        } else {
          console.log("%s %dms", filename, Date.now() - start);

          fs.writeFile(filename, output, "utf8", err => {
            if (err) {
              console.error("Unable to write file: " + filename + "\n" + err);
              // Don't exit the process if one file failed
              process.exitCode = 2;
            }
          });
        }
      } else if (argv["debug-check"]) {
        process.stdout.write("\n");
        if (output) {
          console.log(output);
        }
      } else {
        // Don't use `console.log` here since it adds an extra newline at the end.
        process.stdout.write(output);
      }
    });
  });
}

function eachFilename(patterns, callback) {
  patterns.forEach(pattern => {
    glob(pattern, (err, filenames) => {
      if (err) {
        console.error("Unable to expand glob pattern: " + pattern + "\n" + err);
        // Don't exit the process if one pattern failed
        process.exitCode = 2;
        return;
      }

      filenames.forEach(filename => {
        callback(filename);
      });
    });
  });
}
