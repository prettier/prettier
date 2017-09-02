"use strict";

const chalk = require("chalk");
const dashify = require("dashify");
const fs = require("fs");
const getStream = require("get-stream");
const globby = require("globby");
const minimist = require("minimist");
const path = require("path");
const readline = require("readline");
const ignore = require("ignore");

const prettier = eval("require")("../../index");
const cleanAST = require("../clean-ast").cleanAST;
const resolver = require("../resolve-config");
const constant = require("./constant");

function run(args) {
  const argv = minimist(args, constant.options);

  if (argv["version"]) {
    console.log(prettier.version);
    process.exit(0);
  }

  const filepatterns = argv["_"];
  const write = argv["write"];
  const stdin = argv["stdin"] || (!filepatterns.length && !process.stdin.isTTY);
  const ignoreNodeModules = argv["with-node-modules"] === false;
  const ignoreNodeModulesGlobs = ["!**/node_modules/**", "!./node_modules/**"];
  const ignorePath = argv["ignore-path"];
  const globOptions = {
    dot: true
  };

  if (write && argv["debug-check"]) {
    console.error("Cannot use --write and --debug-check together.");
    process.exit(1);
  }

  if (argv["find-config-path"] && filepatterns.length) {
    console.error("Cannot use --find-config-path with multiple files");
    process.exit(1);
  }

  function getOptionsForFile(filePath) {
    const options =
      argv["config"] === false ? null : resolver.resolveConfig.sync(filePath);

    try {
      const parsedArgs = minimist(args, {
        boolean: constant.booleanOptionNames,
        string: constant.stringOptionNames,
        default: Object.assign(
          {
            semi: true,
            "bracket-spacing": true,
            parser: "babylon"
          },
          dashifyObject(options)
        )
      });
      return getOptions(Object.assign({}, argv, parsedArgs));
    } catch (error) {
      console.error("Invalid configuration file:", error.toString());
      process.exit(2);
    }
  }

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
      console.warn(
        "`--flow-parser` is deprecated. Use `--parser flow` instead."
      );
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

  function format(input, opt) {
    if (argv["debug-print-doc"]) {
      const doc = prettier.__debug.printToDoc(input, opt);
      return { formatted: prettier.__debug.formatDoc(doc) };
    }

    if (argv["debug-check"]) {
      const pp = prettier.format(input, opt);
      const pppp = prettier.format(pp, opt);
      if (pp !== pppp) {
        throw "prettier(input) !== prettier(prettier(input))\n" +
          diff(pp, pppp);
      } else {
        const ast = cleanAST(prettier.__debug.parse(input, opt));
        const past = cleanAST(prettier.__debug.parse(pp, opt));

        if (ast !== past) {
          const MAX_AST_SIZE = 2097152; // 2MB
          const astDiff =
            ast.length > MAX_AST_SIZE || past.length > MAX_AST_SIZE
              ? "AST diff too large to render"
              : diff(ast, past);
          throw "ast(input) !== ast(prettier(input))\n" +
            astDiff +
            "\n" +
            diff(input, pp);
        }
      }
      return { formatted: opt.filepath || "(stdin)\n" };
    }

    return prettier.formatWithCursor(input, opt);
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
      console.error(filename + ":", e.stack || e);
    }

    // Don't exit the process if one file failed
    process.exitCode = 2;
  }

  if (
    argv["help"] ||
    (!filepatterns.length && !stdin && !argv["find-config-path"])
  ) {
    console.log(constant.usage);
    process.exit(argv["help"] ? 0 : 1);
  }

  if (argv["find-config-path"]) {
    resolveConfig(argv["find-config-path"]);
  } else if (stdin) {
    getStream(process.stdin).then(input => {
      const options = getOptionsForFile(process.cwd());

      if (listDifferent(input, options, "(stdin)")) {
        return;
      }

      try {
        writeOutput(format(input, options), options);
      } catch (e) {
        handleError("stdin", e);
      }
    });
  } else {
    eachFilename(filepatterns, (filename, options) => {
      if (write) {
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

      listDifferent(input, options, filename);

      const start = Date.now();

      let result;
      let output;

      try {
        result = format(
          input,
          Object.assign({}, options, { filepath: filename })
        );
        output = result.formatted;
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
          if (!argv["list-different"]) {
            console.log(chalk.grey("%s %dms"), filename, Date.now() - start);
          }
        } else {
          if (argv["list-different"]) {
            console.log(filename);
          } else {
            console.log("%s %dms", filename, Date.now() - start);
          }

          try {
            fs.writeFileSync(filename, output, "utf8");
          } catch (err) {
            console.error("Unable to write file: " + filename + "\n" + err);
            // Don't exit the process if one file failed
            process.exitCode = 2;
          }
        }
      } else if (argv["debug-check"]) {
        if (output) {
          console.log(output);
        } else {
          process.exitCode = 2;
        }
      } else if (!argv["list-different"]) {
        writeOutput(result, options);
      }
    });
  }

  function listDifferent(input, options, filename) {
    if (!argv["list-different"]) {
      return;
    }

    options = Object.assign({}, options, { filepath: filename });

    if (!prettier.check(input, options)) {
      if (!write) {
        console.log(filename);
      }
      process.exitCode = 1;
    }

    return true;
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

  function eachFilename(patterns, callback) {
    // The ignorer will be used to filter file paths after the glob is checked,
    // before any files are actually read
    const ignoreFilePath = path.resolve(ignorePath);
    let ignoreText = "";

    try {
      ignoreText = fs.readFileSync(ignoreFilePath, "utf8");
    } catch (readError) {
      if (readError.code !== "ENOENT") {
        console.error(`Unable to read ${ignoreFilePath}:`, readError);
        process.exit(2);
      }
    }

    const ignorer = ignore().add(ignoreText);

    if (ignoreNodeModules) {
      patterns = patterns.concat(ignoreNodeModulesGlobs);
    }

    return globby(patterns, globOptions)
      .then(filePaths => {
        if (filePaths.length === 0) {
          console.error(
            "No matching files. Patterns tried: " + patterns.join(" ")
          );
          process.exitCode = 2;
          return;
        }
        ignorer
          .filter(filePaths)
          .forEach(filePath => callback(filePath, getOptionsForFile(filePath)));
      })
      .catch(err => {
        console.error(
          "Unable to expand glob patterns: " + patterns.join(" ") + "\n" + err
        );
        // Don't exit the process if one pattern failed
        process.exitCode = 2;
      });
  }
}

module.exports = {
  run
};
