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
    "use-tabs",
    "semi",
    "single-quote",
    "bracket-spacing",
    "jsx-bracket-same-line",
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
  default: { semi: true, color: true, "bracket-spacing": true, parser: "babylon" },
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
      throw new Error("Invalid option for --trailing-comma");
  }
}

const options = {
  useTabs: argv["use-tabs"],
  semi: argv["semi"],
  printWidth: getIntOption("print-width"),
  tabWidth: getIntOption("tab-width"),
  bracketSpacing: argv["bracket-spacing"],
  singleQuote: argv["single-quote"],
  jsxBracketSameLine: argv["jsx-bracket-same-line"],
  trailingComma: getTrailingComma(),
  parser: getParserOption()
};

function format(input) {
  if (argv["debug-print-doc"]) {
    const doc = prettier.__debug.printToDoc(input, options);
    return prettier.__debug.formatDoc(doc);
  }

  if (argv["debug-check"]) {
    function massageAST(ast) {
      if (Array.isArray(ast)) {
        return ast.map(e => massageAST(e)).filter(e => e);
      }
      if (ast && typeof ast === "object") {
        // We remove extra `;` and add them when needed
        if (ast.type === "EmptyStatement") {
          return undefined;
        }

        // We move text around, including whitespaces and add {" "}
        if (ast.type === "JSXText") {
          return undefined;
        }
        if (
          ast.type === "JSXExpressionContainer" &&
          ast.expression.type === "Literal" &&
          ast.expression.value === " "
        ) {
          return undefined;
        }

        const newObj = {};
        for (var key in ast) {
          newObj[key] = massageAST(ast[key]);
        }

        [
          "loc",
          "range",
          "raw",
          "comments",
          "start",
          "end",
          "tokens",
          "flags"
        ].forEach(name => {
          delete newObj[name];
        });

        // We convert <div></div> to <div />
        if (ast.type === "JSXOpeningElement") {
          delete newObj.selfClosing;
        }
        if (ast.type === "JSXElement") {
          delete newObj.closingElement;
        }

        // We change {'key': value} into {key: value}
        if (
          ast.type === "Property" &&
          typeof ast.key === "object" &&
          ast.key &&
          (ast.key.type === "Literal" || ast.key.type === "Identifier")
        ) {
          delete newObj.key;
        }

        return newObj;
      }
      return ast;
    }

    function cleanAST(ast) {
      return JSON.stringify(massageAST(ast), null, 2);
    }

    function diff(a, b) {
      return require("diff")
        .createTwoFilesPatch("", "", a, b, "", "", { context: 2 });
    }

    const pp = prettier.format(input, options);
    const pppp = prettier.format(pp, options);
    if (pp !== pppp) {
      process.stdout.write("\n");
      console.error('prettier(input) !== prettier(prettier(input))');
      console.error(diff(pp, pppp));
    } else {
      const ast = cleanAST(prettier.__debug.parse(input, options));
      const past = cleanAST(prettier.__debug.parse(pp, options));

      if (ast !== past) {
        process.stdout.write("\n");
        console.error('ast(input) !== ast(prettier(input))');
        console.error(diff(ast, past));
        console.error(diff(input, pp));
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
      "  --no-bracket-spacing     Do not print spaces between brackets.\n" +
      "  --jsx-bracket-same-line  Put > on the last line instead of at a new line.\n" +
      "  --trailing-comma <none|es5|all>\n" +
      "                           Print trailing commas wherever possible. Defaults to none.\n" +
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
