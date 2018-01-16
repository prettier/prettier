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

const prettier = require("../../index");
const cleanAST = require("../common/clean-ast").cleanAST;
const errors = require("../common/errors");
const resolver = require("../config/resolve-config");
const constant = require("./constant");
const validator = require("./validator");
const options = require("../main/options");
const apiDefaultOptions = options.defaults;
const normalizeOptions = options.normalize;
const logger = require("./logger");
const thirdParty = require("../common/third-party");

const OPTION_USAGE_THRESHOLD = 25;
const CHOICE_USAGE_MARGIN = 3;
const CHOICE_USAGE_INDENTATION = 2;

function getOptions(argv) {
  return constant.detailedOptions.filter(option => option.forwardToApi).reduce(
    (current, option) =>
      Object.assign(current, {
        [option.forwardToApi]: option.array
          ? [].concat(argv[option.name] || [])
          : argv[option.name]
      }),
    {}
  );
}

function cliifyOptions(object) {
  return Object.keys(object || {}).reduce((output, key) => {
    const apiOption = constant.apiDetailedOptionMap[key];
    const cliKey = apiOption ? apiOption.name : key;

    output[dashify(cliKey)] = object[key];
    return output;
  }, {});
}

function diff(a, b) {
  return require("diff").createTwoFilesPatch("", "", a, b, "", "", {
    context: 2
  });
}

function handleError(filename, error) {
  const isParseError = Boolean(error && error.loc);
  const isValidationError = /Validation Error/.test(error && error.message);

  // For parse errors and validation errors, we only want to show the error
  // message formatted in a nice way. `String(error)` takes care of that. Other
  // (unexpected) errors are passed as-is as a separate argument to
  // `console.error`. That includes the stack trace (if any), and shows a nice
  // `util.inspect` of throws things that aren't `Error` objects. (The Flow
  // parser has mistakenly thrown arrays sometimes.)
  if (isParseError) {
    logger.error(`${filename}: ${String(error)}`);
  } else if (isValidationError || error instanceof errors.ConfigError) {
    logger.error(String(error));
    // If validation fails for one file, it will fail for all of them.
    process.exit(1);
  } else if (error instanceof errors.DebugError) {
    logger.error(`${filename}: ${error.message}`);
  } else {
    logger.error(filename + ": " + (error.stack || error));
  }

  // Don't exit the process if one file failed
  process.exitCode = 2;
}

function logResolvedConfigPathOrDie(filePath) {
  const configFile = resolver.resolveConfigFile.sync(filePath);
  if (configFile) {
    logger.log(path.relative(process.cwd(), configFile));
  } else {
    process.exit(1);
  }
}

function writeOutput(result, options) {
  // Don't use `console.log` here since it adds an extra newline at the end.
  process.stdout.write(result.formatted);

  if (options.cursorOffset >= 0) {
    process.stderr.write(result.cursorOffset + "\n");
  }
}

function listDifferent(argv, input, options, filename) {
  if (!argv["list-different"]) {
    return;
  }

  options = Object.assign({}, options, { filepath: filename });

  if (!prettier.check(input, options)) {
    if (!argv["write"]) {
      logger.log(filename);
    }
    process.exitCode = 1;
  }

  return true;
}

function format(argv, input, opt) {
  if (argv["debug-print-doc"]) {
    const doc = prettier.__debug.printToDoc(input, opt);
    return { formatted: prettier.__debug.formatDoc(doc) };
  }

  if (argv["debug-check"]) {
    const pp = prettier.format(input, opt);
    const pppp = prettier.format(pp, opt);
    if (pp !== pppp) {
      throw new errors.DebugError(
        "prettier(input) !== prettier(prettier(input))\n" + diff(pp, pppp)
      );
    } else {
      const normalizedOpts = normalizeOptions(opt);
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
            : diff(ast, past);
        throw new errors.DebugError(
          "ast(input) !== ast(prettier(input))\n" +
            astDiff +
            "\n" +
            diff(input, pp)
        );
      }
    }
    return { formatted: opt.filepath || "(stdin)\n" };
  }

  return prettier.formatWithCursor(input, opt);
}

function getOptionsOrDie(argv, filePath) {
  try {
    if (argv["config"] === false) {
      logger.debug("'--no-config' option found, skip loading config file.");
      return null;
    }

    logger.debug(
      argv["config"]
        ? `load config file from '${argv["config"]}'`
        : `resolve config from '${filePath}'`
    );
    const options = resolver.resolveConfig.sync(filePath, {
      editorconfig: argv.editorconfig,
      config: argv["config"]
    });

    logger.debug("loaded options `" + JSON.stringify(options) + "`");
    return options;
  } catch (error) {
    logger.error("Invalid configuration file: " + error.message);
    process.exit(2);
  }
}

function getOptionsForFile(argv, filepath) {
  const options = getOptionsOrDie(argv, filepath);

  const appliedOptions = Object.assign(
    { filepath },
    applyConfigPrecedence(
      argv,
      options && normalizeConfig("api", options, constant.detailedOptionMap)
    )
  );

  logger.debug(
    `applied config-precedence (${argv["config-precedence"]}): ` +
      `${JSON.stringify(appliedOptions)}`
  );
  return appliedOptions;
}

function parseArgsToOptions(argv, overrideDefaults) {
  return getOptions(
    normalizeConfig(
      "cli",
      minimist(
        argv.__args,
        Object.assign({
          string: constant.minimistOptions.string,
          boolean: constant.minimistOptions.boolean,
          default: Object.assign(
            {},
            cliifyOptions(apiDefaultOptions),
            cliifyOptions(overrideDefaults)
          )
        })
      ),
      { warning: false }
    )
  );
}

function applyConfigPrecedence(argv, options) {
  try {
    switch (argv["config-precedence"]) {
      case "cli-override":
        return parseArgsToOptions(argv, options);
      case "file-override":
        return Object.assign({}, parseArgsToOptions(argv), options);
      case "prefer-file":
        return options || parseArgsToOptions(argv);
    }
  } catch (error) {
    logger.error(error.toString());
    process.exit(2);
  }
}

function formatStdin(argv) {
  const filepath = argv["stdin-filepath"]
    ? path.resolve(process.cwd(), argv["stdin-filepath"])
    : process.cwd();

  const ignorer = createIgnorer(argv);
  const relativeFilepath = path.relative(process.cwd(), filepath);

  thirdParty.getStream(process.stdin).then(input => {
    if (relativeFilepath && ignorer.filter([relativeFilepath]).length === 0) {
      writeOutput({ formatted: input }, {});
      return;
    }

    const options = getOptionsForFile(argv, filepath);

    if (listDifferent(argv, input, options, "(stdin)")) {
      return;
    }

    try {
      writeOutput(format(argv, input, options), options);
    } catch (error) {
      handleError("stdin", error);
    }
  });
}

function createIgnorer(argv) {
  const ignoreFilePath = path.resolve(argv["ignore-path"]);
  let ignoreText = "";

  try {
    ignoreText = fs.readFileSync(ignoreFilePath, "utf8");
  } catch (readError) {
    if (readError.code !== "ENOENT") {
      logger.error(`Unable to read ${ignoreFilePath}: ` + readError.message);
      process.exit(2);
    }
  }

  return ignore().add(ignoreText);
}

function eachFilename(argv, patterns, callback) {
  const ignoreNodeModules = argv["with-node-modules"] === false;
  if (ignoreNodeModules) {
    patterns = patterns.concat(["!**/node_modules/**", "!./node_modules/**"]);
  }

  try {
    const filePaths = globby
      .sync(patterns, { dot: true, nodir: true })
      .map(filePath => path.relative(process.cwd(), filePath));

    if (filePaths.length === 0) {
      logger.error(`No matching files. Patterns tried: ${patterns.join(" ")}`);
      process.exitCode = 2;
      return;
    }
    filePaths.forEach(filePath =>
      callback(filePath, getOptionsForFile(argv, filePath))
    );
  } catch (error) {
    logger.error(
      `Unable to expand glob patterns: ${patterns.join(" ")}\n${error.message}`
    );
    // Don't exit the process if one pattern failed
    process.exitCode = 2;
  }
}

function formatFiles(argv) {
  // The ignorer will be used to filter file paths after the glob is checked,
  // before any files are actually written
  const ignorer = createIgnorer(argv);

  eachFilename(argv, argv.__filePatterns, (filename, options) => {
    const fileIgnored = ignorer.filter([filename]).length === 0;
    if (fileIgnored && (argv["write"] || argv["list-different"])) {
      return;
    }

    if (argv["write"] && process.stdout.isTTY) {
      // Don't use `console.log` here since we need to replace this line.
      logger.log(filename, { newline: false });
    }

    let input;
    try {
      input = fs.readFileSync(filename, "utf8");
    } catch (error) {
      // Add newline to split errors from filename line.
      logger.log("");

      logger.error(`Unable to read file: ${filename}\n${error.message}`);
      // Don't exit the process if one file failed
      process.exitCode = 2;
      return;
    }

    if (fileIgnored) {
      writeOutput({ formatted: input }, options);
      return;
    }

    listDifferent(argv, input, options, filename);

    const start = Date.now();

    let result;
    let output;

    try {
      result = format(
        argv,
        input,
        Object.assign({}, options, { filepath: filename })
      );
      output = result.formatted;
    } catch (error) {
      // Add newline to split errors from filename line.
      process.stdout.write("\n");

      handleError(filename, error);
      return;
    }

    if (argv["write"]) {
      if (process.stdout.isTTY) {
        // Remove previously printed filename to log it with duration.
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, null);
      }

      // Don't write the file if it won't change in order not to invalidate
      // mtime based caches.
      if (output === input) {
        if (!argv["list-different"]) {
          logger.log(`${chalk.grey(filename)} ${Date.now() - start}ms`);
        }
      } else {
        if (argv["list-different"]) {
          logger.log(filename);
        } else {
          logger.log(`${filename} ${Date.now() - start}ms`);
        }

        try {
          fs.writeFileSync(filename, output, "utf8");
        } catch (error) {
          logger.error(`Unable to write file: ${filename}\n${error.message}`);
          // Don't exit the process if one file failed
          process.exitCode = 2;
        }
      }
    } else if (argv["debug-check"]) {
      if (output) {
        logger.log(output);
      } else {
        process.exitCode = 2;
      }
    } else if (!argv["list-different"]) {
      writeOutput(result, options);
    }
  });
}

function getOptionsWithOpposites(options) {
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
  return flattenArray(optionsWithOpposites).filter(Boolean);
}

function createUsage() {
  const options = getOptionsWithOpposites(constant.detailedOptions).filter(
    // remove unnecessary option (e.g. `semi`, `color`, etc.), which is only used for --help <flag>
    option =>
      !(
        option.type === "boolean" &&
        option.oppositeDescription &&
        !option.name.startsWith("no-")
      )
  );

  const groupedOptions = groupBy(options, option => option.category);

  const firstCategories = constant.categoryOrder.slice(0, -1);
  const lastCategories = constant.categoryOrder.slice(-1);
  const restCategories = Object.keys(groupedOptions).filter(
    category =>
      firstCategories.indexOf(category) === -1 &&
      lastCategories.indexOf(category) === -1
  );
  const allCategories = firstCategories.concat(restCategories, lastCategories);

  const optionsUsage = allCategories.map(category => {
    const categoryOptions = groupedOptions[category]
      .map(option => createOptionUsage(option, OPTION_USAGE_THRESHOLD))
      .join("\n");
    return `${category} options:\n\n${indent(categoryOptions, 2)}`;
  });

  return [constant.usageSummary].concat(optionsUsage, [""]).join("\n\n");
}

function createOptionUsage(option, threshold) {
  const header = createOptionUsageHeader(option);
  const optionDefaultValue = getOptionDefaultValue(option.name);
  return createOptionUsageRow(
    header,
    `${option.description}${
      optionDefaultValue === undefined
        ? ""
        : `\nDefaults to ${optionDefaultValue}.`
    }`,
    threshold
  );
}

function createOptionUsageHeader(option) {
  const name = `--${option.name}`;
  const alias = option.alias ? `-${option.alias},` : null;
  const type = createOptionUsageType(option);
  return [alias, name, type].filter(Boolean).join(" ");
}

function createOptionUsageRow(header, content, threshold) {
  const separator =
    header.length >= threshold
      ? `\n${" ".repeat(threshold)}`
      : " ".repeat(threshold - header.length);

  const description = content.replace(/\n/g, `\n${" ".repeat(threshold)}`);

  return `${header}${separator}${description}`;
}

function createOptionUsageType(option) {
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

function flattenArray(array) {
  return [].concat.apply([], array);
}

function getOptionWithLevenSuggestion(options, optionName) {
  // support aliases
  const optionNameContainers = flattenArray(
    options.map((option, index) => [
      { value: option.name, index },
      option.alias ? { value: option.alias, index } : null
    ])
  ).filter(Boolean);

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
    logger.warn(
      `Unknown option name "${optionName}", did you mean "${suggestedOptionName}"?`
    );

    return options[suggestedOptionNameContainer.index];
  }

  logger.warn(`Unknown option name "${optionName}"`);
  return options.find(option => option.name === "help");
}

function createChoiceUsages(choices, margin, indentation) {
  const activeChoices = choices.filter(choice => !choice.deprecated);
  const threshold =
    activeChoices
      .map(choice => choice.value.length)
      .reduce((current, length) => Math.max(current, length), 0) + margin;
  return activeChoices.map(choice =>
    indent(
      createOptionUsageRow(choice.value, choice.description, threshold),
      indentation
    )
  );
}

function createDetailedUsage(optionName) {
  const option = getOptionWithLevenSuggestion(
    getOptionsWithOpposites(constant.detailedOptions),
    optionName
  );

  const header = createOptionUsageHeader(option);
  const description = `\n\n${indent(option.description, 2)}`;

  const choices =
    option.type !== "choice"
      ? ""
      : `\n\nValid options:\n\n${createChoiceUsages(
          option.choices,
          CHOICE_USAGE_MARGIN,
          CHOICE_USAGE_INDENTATION
        ).join("\n")}`;

  const optionDefaultValue = getOptionDefaultValue(option.name);
  const defaults =
    optionDefaultValue !== undefined
      ? `\n\nDefault: ${optionDefaultValue}`
      : "";

  return `${header}${description}${choices}${defaults}`;
}

function getOptionDefaultValue(optionName) {
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

function indent(str, spaces) {
  return str.replace(/^/gm, " ".repeat(spaces));
}

function groupBy(array, getKey) {
  return array.reduce((obj, item) => {
    const key = getKey(item);
    const previousItems = key in obj ? obj[key] : [];
    return Object.assign({}, obj, { [key]: previousItems.concat(item) });
  }, Object.create(null));
}

/** @param {'api' | 'cli'} type */
function normalizeConfig(type, rawConfig, options) {
  if (type === "api" && rawConfig === null) {
    return null;
  }

  options = options || {};

  const consoleWarn =
    options.warning === false ? () => {} : logger.warn.bind(logger);

  const normalized = {};

  Object.keys(rawConfig).forEach(rawKey => {
    const rawValue = rawConfig[rawKey];

    const key = type === "cli" ? rawKey : dashify(rawKey);

    if (type === "cli" && key === "_") {
      normalized[rawKey] = rawValue;
      return;
    }

    if (type === "cli" && key.length === 1) {
      // do nothing with alias
      return;
    }

    let option = constant.detailedOptionMap[key];
    if (type === "api" && option === undefined) {
      option = constant.apiDetailedOptionMap[key];
    }

    // unknown option
    if (option === undefined) {
      if (type === "api") {
        consoleWarn(`Ignored unknown option: ${rawKey}`);
      } else {
        const optionName = rawValue === false ? `no-${rawKey}` : rawKey;
        consoleWarn(`Ignored unknown option: --${optionName}`);
      }
      return;
    }

    const value = getValue(rawValue, option);

    if (option.exception !== undefined) {
      if (typeof option.exception === "function") {
        if (option.exception(value)) {
          normalized[rawKey] = value;
          return;
        }
      } else {
        if (value === option.exception) {
          normalized[rawKey] = value;
          return;
        }
      }
    }

    try {
      switch (option.type) {
        case "int":
          validator.validateIntOption(type, value, option);
          normalized[rawKey] = Number(value);
          break;
        case "choice":
          validator.validateChoiceOption(type, value, option);
          normalized[rawKey] = value;
          break;
        default:
          normalized[rawKey] = value;
          break;
      }
    } catch (error) {
      logger.error(error.message);
      process.exit(2);
    }
  });

  return normalized;

  function getOptionName(option) {
    return type === "cli" ? `--${option.name}` : camelCase(option.name);
  }

  function getRedirectName(option, choice) {
    return type === "cli"
      ? `--${option.name}=${choice.redirect}`
      : `{ ${camelCase(option.name)}: ${JSON.stringify(choice.redirect)} }`;
  }

  function getValue(rawValue, option) {
    const optionName = getOptionName(option);
    if (rawValue && option.deprecated) {
      let warning = `\`${optionName}\` is deprecated.`;
      if (typeof option.deprecated === "string") {
        warning += ` ${option.deprecated}`;
      }
      consoleWarn(warning);
    }

    const value = option.getter(rawValue, rawConfig);

    if (option.type === "choice") {
      const choice = option.choices.find(choice => choice.value === rawValue);
      if (choice !== undefined && choice.deprecated) {
        const warningDescription =
          rawValue === ""
            ? "without an argument"
            : `with value \`${rawValue}\``;
        const redirectName = getRedirectName(option, choice);
        consoleWarn(
          `\`${optionName}\` ${warningDescription} is deprecated. Prettier now treats it as: \`${redirectName}\`.`
        );
        return choice.redirect;
      }
    }

    return value;
  }
}

module.exports = {
  logResolvedConfigPathOrDie,
  format,
  formatStdin,
  formatFiles,
  createUsage,
  createDetailedUsage,
  normalizeConfig
};
