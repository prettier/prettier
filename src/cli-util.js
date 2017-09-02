"use strict";

const path = require("path");
const dashify = require("dashify");

const resolver = require("./resolve-config");

function getOptions(argv) {
  return {
    cursorOffset: getIntOption(argv, "cursor-offset"),
    rangeStart: getIntOption(argv, "range-start"),
    rangeEnd: getIntOption(argv, "range-end"),
    useTabs: argv["use-tabs"],
    semi: argv["semi"],
    printWidth: getIntOption(argv, "print-width"),
    tabWidth: getIntOption(argv, "tab-width"),
    bracketSpacing: argv["bracket-spacing"],
    singleQuote: argv["single-quote"],
    jsxBracketSameLine: argv["jsx-bracket-same-line"],
    filepath: argv["stdin-filepath"],
    trailingComma: getTrailingComma(argv),
    parser: getParserOption(argv)
  };
}

function getParserOption(argv) {
  const value = argv.parser;

  if (value === undefined) {
    return value;
  }

  // For backward compatibility. Deprecated in 0.0.10
  if (argv["flow-parser"]) {
    console.warn("`--flow-parser` is deprecated. Use `--parser flow` instead.");
    return "flow";
  }

  return value;
}

function getIntOption(argv, optionName) {
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

function getTrailingComma(argv) {
  switch (argv["trailing-comma"]) {
    case undefined:
    case "none":
      return "none";
    case "":
      console.warn(
        "Warning: `--trailing-comma` was used without an argument. This is deprecated. " +
          'Specify "none", "es5", or "all".'
      );
      return "es5";
    case "es5":
      return "es5";
    case "all":
      return "all";
    default:
      throw new Error("Invalid option for --trailing-comma");
  }
}

function dashifyObject(object) {
  return Object.keys(object || {}).reduce((output, key) => {
    output[dashify(key)] = object[key];
    return output;
  }, {});
}

function diff(a, b) {
  return require("diff").createTwoFilesPatch("", "", a, b, "", "", {
    context: 2
  });
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
    console.error(`${filename}: ${String(e)}`);
  } else if (isValidationError) {
    console.error(String(e));
    // If validation fails for one file, it will fail for all of them.
    process.exit(1);
  } else {
    console.error(filename + ":", e.stack || e);
  }

  // Don't exit the process if one file failed
  process.exitCode = 2;
}

function resolveConfig(filePath) {
  const configFile = resolver.resolveConfigFile.sync(filePath);
  if (configFile) {
    console.log(path.relative(process.cwd(), configFile));
  } else {
    process.exitCode = 1;
  }
}

function writeOutput(result, options) {
  // Don't use `console.log` here since it adds an extra newline at the end.
  process.stdout.write(result.formatted);

  if (options.cursorOffset) {
    process.stderr.write(result.cursorOffset + "\n");
  }
}

module.exports = {
  diff,
  dashifyObject,
  getOptions,
  resolveConfig,
  writeOutput,
  handleError
};
