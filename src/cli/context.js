"use strict";

const path = require("path");
const fs = require("fs");
const globby = require("globby");
const chalk = require("chalk");
const readline = require("readline");

const util = require("./util");
const prettier = require("../../index");
const cleanAST = require("../common/clean-ast").cleanAST;
const errors = require("../common/errors");
const optionsModule = require("../main/options");
const optionsNormalizer = require("../main/options-normalizer");
const thirdParty = require("../common/third-party");

/**
 * @property supportOptions
 * @property detailedOptions
 * @property detailedOptionMap
 * @property apiDefaultOptions
 */
class Context {
  constructor(args) {
    this.args = args;

    util.updateContextArgv(this);
    util.normalizeContextArgv(this, ["loglevel", "plugin"]);

    this.logger = util.createLogger(this.argv["loglevel"]);

    util.updateContextArgv(this, this.argv["plugin"]);
  }

  init() {
    // split into 2 step so that we could wrap this in a `try..catch` in cli/index.js
    util.normalizeContextArgv(this);
  }

  formatStdin() {
    const filepath = this.argv["stdin-filepath"]
      ? path.resolve(process.cwd(), this.argv["stdin-filepath"])
      : process.cwd();

    const ignorer = util.createIgnorer(this, this.argv["ignore-path"]);
    const relativeFilepath = path.relative(process.cwd(), filepath);

    thirdParty.getStream(process.stdin).then(input => {
      if (relativeFilepath && ignorer.filter([relativeFilepath]).length === 0) {
        util.writeOutput({ formatted: input }, {});
        return;
      }

      const options = this.getOptionsForFile(filepath);

      if (util.listDifferent(this, input, options, "(stdin)")) {
        return;
      }

      try {
        util.writeOutput(this.format(input, options), options);
      } catch (error) {
        util.handleError(this, "stdin", error);
      }
    });
  }

  formatFiles() {
    // The ignorer will be used to filter file paths after the glob is checked,
    // before any files are actually written
    const ignorer = util.createIgnorer(this, this.argv["ignore-path"]);

    this.eachFilename(this.filePatterns, (filename, options) => {
      const fileIgnored = ignorer.filter([filename]).length === 0;
      if (fileIgnored && (this.argv["write"] || this.argv["list-different"])) {
        return;
      }

      if (this.argv["write"] && process.stdout.isTTY) {
        // Don't use `console.log` here since we need to replace this line.
        this.logger.log(filename, { newline: false });
      }

      let input;
      try {
        input = fs.readFileSync(filename, "utf8");
      } catch (error) {
        // Add newline to split errors from filename line.
        this.logger.log("");

        this.logger.error(`Unable to read file: ${filename}\n${error.message}`);
        // Don't exit the process if one file failed
        process.exitCode = 2;
        return;
      }

      if (fileIgnored) {
        util.writeOutput({ formatted: input }, options);
        return;
      }

      util.listDifferent(this, input, options, filename);

      const start = Date.now();

      let result;
      let output;

      try {
        result = this.format(
          input,
          Object.assign({}, options, { filepath: filename })
        );
        output = result.formatted;
      } catch (error) {
        // Add newline to split errors from filename line.
        process.stdout.write("\n");

        util.handleError(this, filename, error);
        return;
      }

      if (this.argv["write"]) {
        if (process.stdout.isTTY) {
          // Remove previously printed filename to log it with duration.
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0, null);
        }

        // Don't write the file if it won't change in order not to invalidate
        // mtime based caches.
        if (output === input) {
          if (!this.argv["list-different"]) {
            this.logger.log(`${chalk.grey(filename)} ${Date.now() - start}ms`);
          }
        } else {
          if (this.argv["list-different"]) {
            this.logger.log(filename);
          } else {
            this.logger.log(`${filename} ${Date.now() - start}ms`);
          }

          try {
            fs.writeFileSync(filename, output, "utf8");
          } catch (error) {
            this.logger.error(
              `Unable to write file: ${filename}\n${error.message}`
            );
            // Don't exit the process if one file failed
            process.exitCode = 2;
          }
        }
      } else if (this.argv["debug-check"]) {
        if (output) {
          this.logger.log(output);
        } else {
          process.exitCode = 2;
        }
      } else if (!this.argv["list-different"]) {
        util.writeOutput(result, options);
      }
    });
  }

  format(input, opt) {
    if (this.argv["debug-print-doc"]) {
      const doc = prettier.__debug.printToDoc(input, opt);
      return { formatted: prettier.__debug.formatDoc(doc) };
    }

    if (this.argv["debug-check"]) {
      const pp = prettier.format(input, opt);
      const pppp = prettier.format(pp, opt);
      if (pp !== pppp) {
        throw new errors.DebugError(
          "prettier(input) !== prettier(prettier(input))\n" +
            util.createDiff(pp, pppp)
        );
      } else {
        const normalizedOpts = optionsModule.normalize(opt);
        const ast = cleanAST(
          prettier.__debug.parse(input, opt).ast,
          normalizedOpts
        );
        const past = cleanAST(
          prettier.__debug.parse(pp, opt).ast,
          normalizedOpts
        );

        if (ast !== past) {
          const MAX_AST_SIZE = 2097152; // 2MB
          const astDiff =
            ast.length > MAX_AST_SIZE || past.length > MAX_AST_SIZE
              ? "AST diff too large to render"
              : util.createDiff(ast, past);
          throw new errors.DebugError(
            "ast(input) !== ast(prettier(input))\n" +
              astDiff +
              "\n" +
              util.createDiff(input, pp)
          );
        }
      }
      return { formatted: opt.filepath || "(stdin)\n" };
    }

    return prettier.formatWithCursor(input, opt);
  }

  eachFilename(patterns, callback) {
    const ignoreNodeModules = this.argv["with-node-modules"] === false;
    if (ignoreNodeModules) {
      patterns = patterns.concat(["!**/node_modules/**", "!./node_modules/**"]);
    }

    try {
      const filePaths = globby
        .sync(patterns, { dot: true, nodir: true })
        .map(filePath => path.relative(process.cwd(), filePath));

      if (filePaths.length === 0) {
        this.logger.error(
          `No matching files. Patterns tried: ${patterns.join(" ")}`
        );
        process.exitCode = 2;
        return;
      }
      filePaths.forEach(filePath =>
        callback(filePath, this.getOptionsForFile(filePath))
      );
    } catch (error) {
      this.logger.error(
        `Unable to expand glob patterns: ${patterns.join(" ")}\n${
          error.message
        }`
      );
      // Don't exit the process if one pattern failed
      process.exitCode = 2;
    }
  }

  getOptionsForFile(filepath) {
    const options = util.getOptionsOrDie(
      this,
      filepath,
      this.argv["config"],
      this.argv["editorconfig"]
    );

    const hasPlugins = options && options.plugins;
    if (hasPlugins) {
      util.pushContextPlugins(this, options.plugins);
    }

    const appliedOptions = Object.assign(
      { filepath },
      util.applyConfigPrecedence(
        this,
        this.argv["config-precedence"],
        options &&
          optionsNormalizer.normalizeApiOptions(options, this.supportOptions, {
            logger: this.logger
          })
      )
    );

    this.logger.debug(
      `applied config-precedence (${this.argv["config-precedence"]}): ` +
        `${JSON.stringify(appliedOptions)}`
    );

    if (hasPlugins) {
      util.popContextPlugins(this);
    }

    return appliedOptions;
  }
}

module.exports = Context;
