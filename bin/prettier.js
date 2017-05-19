#!/usr/bin/env node

"use strict";

const fs = require("fs");
const getStdin = require("get-stdin");
const glob = require("glob");
const chalk = require("chalk");
const minimist = require("minimist");
const readline = require("readline");
const prettier = require("../index");
const cleanAST = require('../src/clean-ast.js').cleanAST;

const argv = minimist(process.argv.slice(2), {
  boolean: [
    "write",
    "stdin",
    "use-tabs",
    "semi",
    "single-quote",
    "bracket-spacing",
    "braces-spacing",
    "break-property",
    "arrow-parens",
    "array-expand",
    "break-before-else",
    "flatten-ternaries",
    "jsx-bracket-same-line",
    "align-object-properties",
    "space-empty-fn",
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    "color",
    "list-different",
    "help",
    "version",
    "debug-print-doc",
    "debug-check",
    // Deprecated in 0.0.10
    "flow-parser"
  ],
  string: ["print-width", "tab-width", "parser", "trailing-comma"],
  default: { semi: true, color: true, "braces-spacing": true, "space-empty-fn": true, parser: "babylon" },
  alias: { help: "h", version: "v", "list-different": "l" },
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
const stdin = argv["stdin"] || (!filepatterns.length && !process.stdin.isTTY);

if (write && argv["debug-check"]) {
  console.error("Cannot use --write and --debug-check together.");
  process.exit(1);
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

  if (value === "flow" || value === "babylon" || value === "typescript") {
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

function getTrailingComma() {
  switch (argv["trailing-comma"]) {
    case undefined:
    case "none":
      return "none";
    case "":
      console.warn(
        "Warning: `--trailing-comma` was used without an argument. This is deprecated. " +
          'Specify "none", "es5", or "all".'
      );
    case "es5":
      return "es5";
    case "all":
      return "all";
    default:
      // Allow user to customize each item separated with commas
      // see src/options.js
      return argv["trailing-comma"];
      //throw new Error("Invalid option for --trailing-comma");
  }
}

const options = {
  useTabs: argv["use-tabs"],
  semi: argv["semi"],
  printWidth: getIntOption("print-width"),
  tabWidth: getIntOption("tab-width"),
  bracketSpacing: argv["bracket-spacing"],
  bracesSpacing: argv["braces-spacing"],
  breakProperty: argv["break-property"],
  arrowParens: argv["arrow-parens"],
  arrayExpand: argv["array-expand"],
  flattenTernaries: argv["flatten-ternaries"],
  breakBeforeElse: argv["break-before-else"],
  singleQuote: argv["single-quote"],
  jsxBracketSameLine: argv["jsx-bracket-same-line"],
  noSpaceEmptyFn: !argv["space-empty-fn"],
  trailingComma: getTrailingComma(),
  alignObjectProperties: argv["align-object-properties"],
  parser: getParserOption()
};

function format(input) {
  if (argv["debug-print-doc"]) {
    const doc = prettier.__debug.printToDoc(input, options);
    return prettier.__debug.formatDoc(doc);
  }

  if (argv["debug-check"]) {
    function diff(a, b) {
      return require("diff")
        .createTwoFilesPatch("", "", a, b, "", "", { context: 2 });
    }

    const pp = prettier.format(input, options);
    const pppp = prettier.format(pp, options);
    if (pp !== pppp) {
      throw "prettier(input) !== prettier(prettier(input))\n" + diff(pp, pppp);
    } else {
      const ast = cleanAST(prettier.__debug.parse(input, options));
      const past = cleanAST(prettier.__debug.parse(pp, options));

      if (ast !== past) {
        const MAX_AST_SIZE = 2097152; // 2MB
        const astDiff = (ast.length > MAX_AST_SIZE || past.length > MAX_AST_SIZE)
          ? "AST diff too large to render"
          : diff(ast, past);
        throw (
          "ast(input) !== ast(prettier(input))\n" +
          astDiff + "\n" +
          diff(input, pp)
        );
      }
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

if (argv["help"] || (!filepatterns.length && !stdin)) {
  console.log(
    "Usage: prettier [opts] [filename ...]\n\n" +
      "Available options:\n" +
      "  --write                  Edit the file in-place. (Beware!)\n" +
      "  --list-different or -l   Print filenames of files that are different from Prettier formatting.\n" +
      "  --stdin                  Read input from stdin.\n" +
      "  --print-width <int>      Specify the length of line that the printer will wrap on. Defaults to 80.\n" +
      "  --tab-width <int>        Specify the number of spaces per indentation-level. Defaults to 2.\n" +
      "  --use-tabs               Indent lines with tabs instead of spaces.\n" +
      "  --no-semi                Do not print semicolons, except at the beginning of lines which may need them.\n" +
      "  --single-quote           Use single quotes instead of double quotes.\n" +
      "  --bracket-spacing        Print spaces between [brackets].\n" +
      "  --no-braces-spacing      Do not print spaces between {braces}.\n" +
      "  --break-property         Allow object properties to break lines.\n" +
      "  --arrow-parens           Always put parentheses on arrow function arguments.\n" +
      "  --array-expand           Expand arrays into one item per line.\n" +
      "  --flatten-ternaries      Format ternaries in a flat style.\n" +
      "  --break-before-else      Put `else` clause in a new line.\n" +
      "  --jsx-bracket-same-line  Put > on the last line instead of at a new line.\n" +
      "  --trailing-comma <none|es5|all>\n" +
      "                           Print trailing commas wherever possible. Defaults to none.\n" +
      "                           You can customize with a comma separated list. 'all' is equivalent to:\n" +
      "                           'array,object,import,export,arguments'\n" +
      "  --align-object-properties\n" +
      "                           Align colons in multiline object literals. Does nothing if object has computed property names.\n" +
      "  --no-space-empty-fn      Omit space before empty function body. Defaults to false.\n" +
      "  --parser <flow|babylon>  Specify which parse to use. Defaults to babylon.\n" +
      "  --no-color               Do not colorize error messages.\n" +
      "  --version or -v          Print Prettier version.\n" +
      "\n"
  );
  process.exit(argv["help"] ? 0 : 1);
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
    if (write || argv["debug-check"]) {
      // Don't use `console.log` here since we need to replace this line.
      process.stdout.write(filename);
    }

    let input;
    try {
      input = fs.readFileSync(filename, "utf8");
    } catch (e) {
      // Add newline to split errors from filename line.
      process.stdout.write("\n");

      console.error("Unable to read file: " + filename + "\n" + e);
      // Don't exit the process if one file failed
      process.exitCode = 2;
      return;
    }

    if (argv["list-different"]) {
      if (!prettier.check(input, options)) {
        console.log(filename);
        process.exitCode = 1;
      }
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

        try {
          fs.writeFileSync(filename, output, "utf8");
        } catch (err) {
          console.error("Unable to write file: " + filename + "\n" + err);
          // Don't exit the process if one file failed
          process.exitCode = 2;
        }
      }
    } else if (argv["debug-check"]) {
      process.stdout.write("\n");
      if (output) {
        console.log(output);
      } else {
        process.exitCode = 2;
      }
    } else {
      // Don't use `console.log` here since it adds an extra newline at the end.
      process.stdout.write(output);
    }
  });
}

function eachFilename(patterns, callback) {
  patterns.forEach(pattern => {
    if (!glob.hasMagic(pattern)) {
      callback(pattern);
      return;
    }

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
