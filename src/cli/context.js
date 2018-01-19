"use strict";

const path = require("path");
const camelCase = require("camelcase");
const dashify = require("dashify");
const minimist = require("minimist");
const fs = require("fs");
const globby = require("globby");
const ignore = require("ignore");
const chalk = require("chalk");
const readline = require("readline");
const leven = require("leven");

const util = require("./util");
const normalizer = require("../main/options-normalizer");
const prettier = require("../../index");
const cleanAST = require("../common/clean-ast").cleanAST;
const errors = require("../common/errors");
const resolver = require("../config/resolve-config");
const constant = require("./constant");
const optionsModule = require("../main/options");
const apiDefaultOptions = optionsModule.defaults;
const optionsNormalizer = require("../main/options-normalizer");
const thirdParty = require("../common/third-party");
const optionInfos = require("../common/support").getSupportInfo(null, {
  showDeprecated: true,
  showUnreleased: true
}).options;

const OPTION_USAGE_THRESHOLD = 25;
const CHOICE_USAGE_MARGIN = 3;
const CHOICE_USAGE_INDENTATION = 2;

class Context {
  constructor(args) {
    const rawArgv = minimist(args, constant.minimistOptions);

    const logger = util.createLogger(
      rawArgv["loglevel"] || constant.detailedOptionMap["loglevel"].default
    );

    this.args = args;
    this.rawArgv = rawArgv;
    this.logger = logger;
  }

  init() {
    this.argv = normalizer.normalizeCliOptions(
      this.rawArgv,
      constant.detailedOptions,
      { logger: this.logger }
    );
    this.filePatterns = this.argv["_"];
  }

  getOptions(argv) {
    return constant.detailedOptions
      .filter(option => option.forwardToApi)
      .reduce(
        (current, option) =>
          Object.assign(current, {
            [option.forwardToApi]: argv[option.name]
          }),
        {}
      );
  }

  cliifyOptions(object) {
    return Object.keys(object || {}).reduce((output, key) => {
      const apiOption = constant.apiDetailedOptionMap[key];
      const cliKey = apiOption ? apiOption.name : key;

      output[dashify(cliKey)] = object[key];
      return output;
    }, {});
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

  logResolvedConfigPathOrDie(filePath) {
    const configFile = resolver.resolveConfigFile.sync(filePath);
    if (configFile) {
      this.logger.log(path.relative(process.cwd(), configFile));
    } else {
      process.exit(1);
    }
  }

  writeOutput(result, options) {
    // Don't use `console.log` here since it adds an extra newline at the end.
    process.stdout.write(result.formatted);

    if (options.cursorOffset >= 0) {
      process.stderr.write(result.cursorOffset + "\n");
    }
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

  getOptionsOrDie(filePath) {
    try {
      if (this.argv["config"] === false) {
        this.logger.debug(
          "'--no-config' option found, skip loading config file."
        );
        return null;
      }

      this.logger.debug(
        this.argv["config"]
          ? `load config file from '${this.argv["config"]}'`
          : `resolve config from '${filePath}'`
      );
      const options = resolver.resolveConfig.sync(filePath, {
        editorconfig: this.argv.editorconfig,
        config: this.argv["config"]
      });

      this.logger.debug("loaded options `" + JSON.stringify(options) + "`");
      return options;
    } catch (error) {
      this.logger.error("Invalid configuration file: " + error.message);
      process.exit(2);
    }
  }

  getOptionsForFile(filepath) {
    const options = this.getOptionsOrDie(filepath);

    const appliedOptions = Object.assign(
      { filepath },
      this.applyConfigPrecedence(
        options &&
          optionsNormalizer.normalizeApiOptions(options, optionInfos, {
            logger: this.logger
          })
      )
    );

    this.logger.debug(
      `applied config-precedence (${this.argv["config-precedence"]}): ` +
        `${JSON.stringify(appliedOptions)}`
    );
    return appliedOptions;
  }

  parseArgsToOptions(overrideDefaults) {
    return this.getOptions(
      optionsNormalizer.normalizeCliOptions(
        minimist(
          this.args,
          Object.assign({
            string: constant.minimistOptions.string,
            boolean: constant.minimistOptions.boolean,
            default: Object.assign(
              {},
              this.cliifyOptions(apiDefaultOptions),
              this.cliifyOptions(overrideDefaults)
            )
          })
        ),
        constant.detailedOptions,
        { logger: false }
      )
    );
  }

  applyConfigPrecedence(options) {
    try {
      switch (this.argv["config-precedence"]) {
        case "cli-override":
          return this.parseArgsToOptions(options);
        case "file-override":
          return Object.assign({}, this.parseArgsToOptions(), options);
        case "prefer-file":
          return options || this.parseArgsToOptions();
      }
    } catch (error) {
      this.logger.error(error.toString());
      process.exit(2);
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
        this.writeOutput({ formatted: input }, {});
        return;
      }

      const options = this.getOptionsForFile(filepath);

      if (this.listDifferent(input, options, "(stdin)")) {
        return;
      }

      try {
        this.writeOutput(this.format(input, options), options);
      } catch (error) {
        this.handleError("stdin", error);
      }
    });
  }

  createIgnorer() {
    const ignoreFilePath = path.resolve(this.argv["ignore-path"]);
    let ignoreText = "";

    try {
      ignoreText = fs.readFileSync(ignoreFilePath, "utf8");
    } catch (readError) {
      if (readError.code !== "ENOENT") {
        this.logger.error(
          `Unable to read ${ignoreFilePath}: ` + readError.message
        );
        process.exit(2);
      }
    }

    return ignore().add(ignoreText);
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
        this.writeOutput({ formatted: input }, options);
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
        this.writeOutput(result, options);
      }
    });
  }

  getOptionsWithOpposites(options) {
    // Add --no-foo after --foo.
    const optionsWithOpposites = options.map(option => [
      option.description ? option : null,
      option.oppositeDescription
        ? Object.assign({}, option, {
            name: `no-${option.name}`,
            type: "boolean",
            description: option.oppositeDescription
          })
        : null
    ]);
    return util.flattenArray(optionsWithOpposites).filter(Boolean);
  }

  createUsage() {
    const options = this.getOptionsWithOpposites(
      constant.detailedOptions
    ).filter(
      // remove unnecessary option (e.g. `semi`, `color`, etc.), which is only used for --help <flag>
      option =>
        !(
          option.type === "boolean" &&
          option.oppositeDescription &&
          !option.name.startsWith("no-")
        )
    );

    const groupedOptions = util.groupBy(options, option => option.category);

    const firstCategories = constant.categoryOrder.slice(0, -1);
    const lastCategories = constant.categoryOrder.slice(-1);
    const restCategories = Object.keys(groupedOptions).filter(
      category =>
        firstCategories.indexOf(category) === -1 &&
        lastCategories.indexOf(category) === -1
    );
    const allCategories = firstCategories.concat(
      restCategories,
      lastCategories
    );

    const optionsUsage = allCategories.map(category => {
      const categoryOptions = groupedOptions[category]
        .map(option => this.createOptionUsage(option, OPTION_USAGE_THRESHOLD))
        .join("\n");
      return `${category} options:\n\n${util.indent(categoryOptions, 2)}`;
    });

    return [constant.usageSummary].concat(optionsUsage, [""]).join("\n\n");
  }

  createOptionUsage(option, threshold) {
    const header = this.createOptionUsageHeader(option);
    const optionDefaultValue = this.getOptionDefaultValue(option.name);
    return this.createOptionUsageRow(
      header,
      `${option.description}${
        optionDefaultValue === undefined
          ? ""
          : `\nDefaults to ${this.createDefaultValueDisplay(
              optionDefaultValue
            )}.`
      }`,
      threshold
    );
  }

  createDefaultValueDisplay(value) {
    return Array.isArray(value)
      ? `[${value.map(this.createDefaultValueDisplay).join(", ")}]`
      : value;
  }

  createOptionUsageHeader(option) {
    const name = `--${option.name}`;
    const alias = option.alias ? `-${option.alias},` : null;
    const type = this.createOptionUsageType(option);
    return [alias, name, type].filter(Boolean).join(" ");
  }

  createOptionUsageRow(header, content, threshold) {
    const separator =
      header.length >= threshold
        ? `\n${" ".repeat(threshold)}`
        : " ".repeat(threshold - header.length);

    const description = content.replace(/\n/g, `\n${" ".repeat(threshold)}`);

    return `${header}${separator}${description}`;
  }

  createOptionUsageType(option) {
    switch (option.type) {
      case "boolean":
        return null;
      case "choice":
        return `<${option.choices
          .filter(choice => !choice.deprecated)
          .map(choice => choice.value)
          .join("|")}>`;
      default:
        return `<${option.type}>`;
    }
  }

  getOptionWithLevenSuggestion(options, optionName) {
    // support aliases
    const optionNameContainers = util
      .flattenArray(
        options.map((option, index) => [
          { value: option.name, index },
          option.alias ? { value: option.alias, index } : null
        ])
      )
      .filter(Boolean);

    const optionNameContainer = optionNameContainers.find(
      optionNameContainer => optionNameContainer.value === optionName
    );

    if (optionNameContainer !== undefined) {
      return options[optionNameContainer.index];
    }

    const suggestedOptionNameContainer = optionNameContainers.find(
      optionNameContainer => leven(optionNameContainer.value, optionName) < 3
    );

    if (suggestedOptionNameContainer !== undefined) {
      const suggestedOptionName = suggestedOptionNameContainer.value;
      this.logger.warn(
        `Unknown option name "${optionName}", did you mean "${suggestedOptionName}"?`
      );

      return options[suggestedOptionNameContainer.index];
    }

    this.logger.warn(`Unknown option name "${optionName}"`);
    return options.find(option => option.name === "help");
  }

  createChoiceUsages(choices, margin, indentation) {
    const activeChoices = choices.filter(choice => !choice.deprecated);
    const threshold =
      activeChoices
        .map(choice => choice.value.length)
        .reduce((current, length) => Math.max(current, length), 0) + margin;
    return activeChoices.map(choice =>
      util.indent(
        this.createOptionUsageRow(choice.value, choice.description, threshold),
        indentation
      )
    );
  }

  createDetailedUsage(optionName) {
    const option = this.getOptionWithLevenSuggestion(
      this.getOptionsWithOpposites(constant.detailedOptions),
      optionName
    );

    const header = this.createOptionUsageHeader(option);
    const description = `\n\n${util.indent(option.description, 2)}`;

    const choices =
      option.type !== "choice"
        ? ""
        : `\n\nValid options:\n\n${this.createChoiceUsages(
            option.choices,
            CHOICE_USAGE_MARGIN,
            CHOICE_USAGE_INDENTATION
          ).join("\n")}`;

    const optionDefaultValue = this.getOptionDefaultValue(option.name);
    const defaults =
      optionDefaultValue !== undefined
        ? `\n\nDefault: ${this.createDefaultValueDisplay(optionDefaultValue)}`
        : "";

    return `${header}${description}${choices}${defaults}`;
  }

  getOptionDefaultValue(optionName) {
    // --no-option
    if (!(optionName in constant.detailedOptionMap)) {
      return undefined;
    }

    const option = constant.detailedOptionMap[optionName];

    if (option.default !== undefined) {
      return option.default;
    }

    const optionCamelName = camelCase(optionName);
    if (optionCamelName in apiDefaultOptions) {
      return apiDefaultOptions[optionCamelName];
    }

    return undefined;
  }
}

module.exports = Context;
