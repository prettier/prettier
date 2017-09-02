"use strict";

const chalk = require("chalk");
const fs = require("fs");
const getStream = require("get-stream");
const globby = require("globby");
const minimist = require("minimist");
const path = require("path");
const readline = require("readline");
const ignore = require("ignore");

const prettier = eval("require")("../index");
const resolver = require("./resolve-config");
const constant = require("./cli-constant");
const util = require("./cli-util");

function run(args) {
  const argv = minimist(args, constant.options);

  if (argv["version"]) {
    console.log(prettier.version);
    process.exit(0);
  }

  const filepatterns = argv["_"];
  const stdin = argv["stdin"] || (!filepatterns.length && !process.stdin.isTTY);

  if (argv["write"] && argv["debug-check"]) {
    console.error("Cannot use --write and --debug-check together.");
    process.exit(1);
  }

  if (argv["find-config-path"] && filepatterns.length) {
    console.error("Cannot use --find-config-path with multiple files");
    process.exit(1);
  }

  if (
    argv["help"] ||
    (!filepatterns.length && !stdin && !argv["find-config-path"])
  ) {
    console.log(constant.usage);
    process.exit(argv["help"] ? 0 : 1);
  }

  if (argv["find-config-path"]) {
    util.resolveConfig(argv["find-config-path"]);
  } else if (stdin) {
    formatStdin();
  } else {
    formatFiles();
  }

  function formatStdin() {
    getStream(process.stdin).then(input => {
      const options = getOptionsForFile(process.cwd());

      if (util.listDifferent(argv, input, options, "(stdin)")) {
        return;
      }

      try {
        util.writeOutput(util.format(argv, input, options), options);
      } catch (e) {
        util.handleError("stdin", e);
      }
    });
  }

  function formatFiles() {
    eachFilename(filepatterns, (filename, options) => {
      if (argv["write"]) {
        // Don't use `console.log` here since we need to replace this line.
        process.stdout.write(filename);
      }

      let input;
      try {
        input = fs.readFileSync(filename, "utf8");
      } catch (e) {
        // Add newline to split errors from filename line.
        process.stdout.write("\n");

        console.error(`Unable to read file: ${filename}\n${e}`);
        // Don't exit the process if one file failed
        process.exitCode = 2;
        return;
      }

      util.listDifferent(argv, input, options, filename);

      const start = Date.now();

      let result;
      let output;

      try {
        result = util.format(
          argv,
          input,
          Object.assign({}, options, { filepath: filename })
        );
        output = result.formatted;
      } catch (e) {
        // Add newline to split errors from filename line.
        process.stdout.write("\n");

        util.handleError(filename, e);
        return;
      }

      if (argv["write"]) {
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
            console.error(`Unable to write file: ${filename}\n${err}`);
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
        util.writeOutput(result, options);
      }
    });
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
          util.dashifyObject(options)
        )
      });
      return util.getOptions(Object.assign({}, argv, parsedArgs));
    } catch (error) {
      console.error("Invalid configuration file:", error.toString());
      process.exit(2);
    }
  }

  function eachFilename(patterns, callback) {
    const ignoreNodeModules = argv["with-node-modules"] === false;
    // The ignorer will be used to filter file paths after the glob is checked,
    // before any files are actually read
    const ignoreFilePath = path.resolve(argv["ignore-path"]);
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
      patterns = patterns.concat(["!**/node_modules/**", "!./node_modules/**"]);
    }

    return globby(patterns, { dot: true })
      .then(filePaths => {
        if (filePaths.length === 0) {
          console.error(
            `No matching files. Patterns tried: ${patterns.join(" ")}`
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
          `Unable to expand glob patterns: ${patterns.join(" ")}\n${err}`
        );
        // Don't exit the process if one pattern failed
        process.exitCode = 2;
      });
  }
}

module.exports = {
  run
};
