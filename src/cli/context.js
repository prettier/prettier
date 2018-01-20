"use strict";

const path = require("path");
const minimist = require("minimist");
const fs = require("fs");
const globby = require("globby");
const chalk = require("chalk");
const readline = require("readline");

const util = require("./util");
const normalizer = require("../main/options-normalizer");
const prettier = require("../../index");
const cleanAST = require("../common/clean-ast").cleanAST;
const errors = require("../common/errors");
const resolver = require("../config/resolve-config");
const constant = require("./constant");
const optionsModule = require("../main/options");
const optionsNormalizer = require("../main/options-normalizer");
const thirdParty = require("../common/third-party");
const getSupportInfo = require("../common/support").getSupportInfo;
const commonUtil = require("../common/util");

const OPTION_USAGE_THRESHOLD = 25;
const CHOICE_USAGE_MARGIN = 3;
const CHOICE_USAGE_INDENTATION = 2;

// context

function updateContextOptions(context, plugins) {
  const supportOptions = getSupportInfo(null, {
    showDeprecated: true,
    showUnreleased: true,
    showInternal: true,
    plugins
  }).options;

  const detailedOptionMap = util.normalizeDetailedOptionMap(
    Object.assign(
      {},
      util.createDetailedOptionMap(supportOptions),
      constant.options
    )
  );

  const detailedOptions = commonUtil.arrayify(detailedOptionMap, "name");

  const apiDefaultOptions = supportOptions
    .filter(optionInfo => !optionInfo.deprecated)
    .reduce(
      (reduced, optionInfo) =>
        Object.assign(reduced, { [optionInfo.name]: optionInfo.default }),
      Object.assign({}, optionsModule.hiddenDefaults)
    );

  context.supportOptions = supportOptions;
  context.detailedOptions = detailedOptions;
  context.detailedOptionMap = detailedOptionMap;
  context.apiDefaultOptions = apiDefaultOptions;
}

function pushContextPlugins(context, plugins) {
  context._supportOptions = context.supportOptions;
  context._detailedOptions = context.detailedOptions;
  context._detailedOptionMap = context.detailedOptionMap;
  context._apiDefaultOptions = context.apiDefaultOptions;
  updateContextOptions(context, plugins);
}

function popContextPlugins(context) {
  context.supportOptions = context._supportOptions;
  context.detailedOptions = context._detailedOptions;
  context.detailedOptionMap = context._detailedOptionMap;
  context.apiDefaultOptions = context._apiDefaultOptions;
}

function updateContextArgv(context, plugins) {
  pushContextPlugins(context, plugins);

  const minimistOptions = util.createMinimistOptions(context.detailedOptions);
  const argv = minimist(context.args, minimistOptions);

  context.argv = argv;
  context.filePatterns = argv["_"];
}

//

/**
 * @property supportOptions
 * @property detailedOptions
 * @property detailedOptionMap
 * @property apiDefaultOptions
 */
class Context {
  constructor(args) {
    this.args = args;

    updateContextArgv(this);
    this.normalizeArgv(["loglevel", "plugin"]);

    this.logger = util.createLogger(this.argv["loglevel"]);

    updateContextArgv(this, this.argv["plugin"]);
  }

  init() {
    // split into 2 step so that we could wrap this in a `try..catch` in cli/index.js
    this.normalizeArgv();
  }

  normalizeArgv(keys) {
    const detailedOptions = !keys
      ? this.detailedOptions
      : this.detailedOptions.filter(option => keys.indexOf(option.name) !== -1);
    const argv = !keys ? this.argv : util.pick(this.argv, keys);

    this.argv = normalizer.normalizeCliOptions(argv, detailedOptions, {
      logger: this.logger
    });
  }

  logResolvedConfigPathOrDie(filePath) {
    const configFile = resolver.resolveConfigFile.sync(filePath);
    if (configFile) {
      this.logger.log(path.relative(process.cwd(), configFile));
    } else {
      process.exit(1);
    }
  }

  formatStdin() {
    const filepath = this.argv["stdin-filepath"]
      ? path.resolve(process.cwd(), this.argv["stdin-filepath"])
      : process.cwd();

    const ignorer = this.createIgnorer();
    const relativeFilepath = path.relative(process.cwd(), filepath);

    thirdParty.getStream(process.stdin).then(input => {
      if (relativeFilepath && ignorer.filter([relativeFilepath]).length === 0) {
        util.writeOutput({ formatted: input }, {});
        return;
      }

      const options = this.getOptionsForFile(filepath);

      if (this.listDifferent(input, options, "(stdin)")) {
        return;
      }

      try {
        util.writeOutput(this.format(input, options), options);
      } catch (error) {
        this.handleError("stdin", error);
      }
    });
  }

  formatFiles() {
    // The ignorer will be used to filter file paths after the glob is checked,
    // before any files are actually written
    const ignorer = this.createIgnorer();

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

      this.listDifferent(input, options, filename);

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

        this.handleError(filename, error);
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

  handleError(filename, error) {
    const isParseError = Boolean(error && error.loc);
    const isValidationError = /Validation Error/.test(error && error.message);

    // For parse errors and validation errors, we only want to show the error
    // message formatted in a nice way. `String(error)` takes care of that. Other
    // (unexpected) errors are passed as-is as a separate argument to
    // `console.error`. That includes the stack trace (if any), and shows a nice
    // `util.inspect` of throws things that aren't `Error` objects. (The Flow
    // parser has mistakenly thrown arrays sometimes.)
    if (isParseError) {
      this.logger.error(`${filename}: ${String(error)}`);
    } else if (isValidationError || error instanceof errors.ConfigError) {
      this.logger.error(String(error));
      // If validation fails for one file, it will fail for all of them.
      process.exit(1);
    } else if (error instanceof errors.DebugError) {
      this.logger.error(`${filename}: ${error.message}`);
    } else {
      this.logger.error(filename + ": " + (error.stack || error));
    }

    // Don't exit the process if one file failed
    process.exitCode = 2;
  }

  listDifferent(input, options, filename) {
    if (!this.argv["list-different"]) {
      return;
    }

    options = Object.assign({}, options, { filepath: filename });

    if (!prettier.check(input, options)) {
      if (!this.argv["write"]) {
        this.logger.log(filename);
      }
      process.exitCode = 1;
    }

    return true;
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
    const options = this.getOptionsOrDie(filepath);

    const hasPlugins = options && options.plugins;
    if (hasPlugins) {
      pushContextPlugins(this, options.plugins);
    }

    const appliedOptions = Object.assign(
      { filepath },
      this.applyConfigPrecedence(
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
      popContextPlugins(this);
    }

    return appliedOptions;
  }

  getOptionsOrDie(filePath) {
    try {
      return util.resolveOptions(
        filePath,
        this.argv["config"],
        this.argv["editorconfig"],
        this.logger
      );
    } catch (error) {
      this.logger.error("Invalid configuration file: " + error.message);
      process.exit(2);
    }
  }

  applyConfigPrecedence(options) {
    try {
      return util.applyConfigPrecedence(
        this.argv["config-precedence"],
        this.args,
        this.detailedOptions,
        this.apiDefaultOptions,
        options
      );
    } catch (error) {
      this.logger.error(error.toString());
      process.exit(2);
    }
  }

  createIgnorer() {
    try {
      return util.createIgnorer(this.argv["ignore-path"]);
    } catch (error) {
      this.logger.error(error.message);
      process.exit(2);
    }
  }

  createUsage() {
    return util.createUsage(
      constant.usageSummary,
      OPTION_USAGE_THRESHOLD,
      constant.categoryOrder,
      this.detailedOptionMap,
      this.apiDefaultOptions
    );
  }

  createDetailedUsage(optionName) {
    const option = util.getOptionWithLevenSuggestion(
      util.getOptionsWithOpposites(this.detailedOptions),
      optionName,
      this.logger
    );
    return util.createDetailedUsage(
      option,
      CHOICE_USAGE_MARGIN,
      CHOICE_USAGE_INDENTATION,
      this.detailedOptionMap,
      this.apiDefaultOptions
    );
  }
}

module.exports = Context;
