"use strict";

const camelCase = require("camelcase");
const chalk = require("chalk");
const dashify = require("dashify");
const diff = require("diff");
const util = require("../common/util");

const CATEGORY_FORMAT = "Format";
const CATEGORY_OTHER = "Other";

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

function createLogger(logLevel) {
  return {
    warn: createLogFunc("warn", "yellow"),
    error: createLogFunc("error", "red"),
    debug: createLogFunc("debug", "blue"),
    log: createLogFunc("log")
  };

  function createLogFunc(loggerName, color) {
    if (!shouldLog(loggerName)) {
      return () => {};
    }

    const prefix = color ? `[${chalk[color](loggerName)}] ` : "";
    return function(message, opts) {
      opts = Object.assign({ newline: true }, opts);
      const stream = process[loggerName === "log" ? "stdout" : "stderr"];
      stream.write(message.replace(/^/gm, prefix) + (opts.newline ? "\n" : ""));
    };
  }

  function shouldLog(loggerName) {
    switch (logLevel) {
      case "silent":
        return false;
      default:
        return true;
      case "debug":
        if (loggerName === "debug") {
          return true;
        }
      // fall through
      case "log":
        if (loggerName === "log") {
          return true;
        }
      // fall through
      case "warn":
        if (loggerName === "warn") {
          return true;
        }
      // fall through
      case "error":
        return loggerName === "error";
    }
  }
}

function normalizeDetailedOption(name, option) {
  return Object.assign({ category: CATEGORY_OTHER }, option, {
    choices:
      option.choices &&
      option.choices.map(choice => {
        const newChoice = Object.assign(
          { description: "", deprecated: false },
          typeof choice === "object" ? choice : { value: choice }
        );
        if (newChoice.value === true) {
          newChoice.value = ""; // backward compability for original boolean option
        }
        return newChoice;
      })
  });
}

function normalizeDetailedOptionMap(detailedOptionMap) {
  return Object.keys(detailedOptionMap)
    .sort()
    .reduce((normalized, name) => {
      const option = detailedOptionMap[name];
      return Object.assign(normalized, {
        [name]: normalizeDetailedOption(name, option)
      });
    }, {});
}

function createMinimistOptions(detailedOptions) {
  return {
    boolean: detailedOptions
      .filter(option => option.type === "boolean")
      .map(option => option.name),
    string: detailedOptions
      .filter(option => option.type !== "boolean")
      .map(option => option.name),
    default: detailedOptions
      .filter(option => !option.deprecated)
      .filter(option => option.default !== undefined)
      .reduce(
        (current, option) =>
          Object.assign({ [option.name]: option.default }, current),
        {}
      ),
    alias: detailedOptions
      .filter(option => option.alias !== undefined)
      .reduce(
        (current, option) =>
          Object.assign({ [option.name]: option.alias }, current),
        {}
      )
  };
}

function createApiDetailedOptionMap(detailedOptions) {
  return detailedOptions.reduce(
    (current, option) =>
      option.forwardToApi && option.forwardToApi !== option.name
        ? Object.assign(current, { [option.forwardToApi]: option })
        : current,
    {}
  );
}

function createDetailedOptionMap(supportOptions) {
  return supportOptions.reduce((reduced, option) => {
    const newOption = Object.assign({}, option, {
      name: option.cliName || dashify(option.name),
      description: option.cliDescription || option.description,
      category: option.cliCategory || CATEGORY_FORMAT,
      forwardToApi: option.name
    });

    if (option.deprecated) {
      delete newOption.forwardToApi;
      delete newOption.description;
      delete newOption.oppositeDescription;
      newOption.deprecated = true;
    }

    return Object.assign(reduced, { [newOption.name]: newOption });
  }, {});
}

function flattenArray(array) {
  return [].concat.apply([], array);
}

function createDiff(a, b) {
  return diff.createTwoFilesPatch("", "", a, b, "", "", {
    context: 2
  });
}

function getOptionDefaultValue(
  optionName,
  detailedOptionMap,
  apiDefaultOptions
) {
  // --no-option
  if (!(optionName in detailedOptionMap)) {
    return undefined;
  }

  const option = detailedOptionMap[optionName];

  if (option.default !== undefined) {
    return option.default;
  }

  const optionCamelName = camelCase(optionName);
  if (optionCamelName in apiDefaultOptions) {
    return apiDefaultOptions[optionCamelName];
  }

  return undefined;
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

function createDefaultValueDisplay(value) {
  return Array.isArray(value)
    ? `[${value.map(createDefaultValueDisplay).join(", ")}]`
    : value;
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

function createOptionUsage(
  option,
  threshold,
  detailedOptionMap,
  apiDefaultOptions
) {
  const header = createOptionUsageHeader(option);
  const optionDefaultValue = getOptionDefaultValue(
    option.name,
    detailedOptionMap,
    apiDefaultOptions
  );
  return createOptionUsageRow(
    header,
    `${option.description}${
      optionDefaultValue === undefined
        ? ""
        : `\nDefaults to ${createDefaultValueDisplay(optionDefaultValue)}.`
    }`,
    threshold
  );
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

function createUsage(
  usageSummary,
  threshold,
  categoryOrder,
  detailedOptionMap,
  apiDefaultOptions
) {
  const detailedOptions = util.arrayify(detailedOptionMap, "name");
  const options = getOptionsWithOpposites(detailedOptions).filter(
    // remove unnecessary option (e.g. `semi`, `color`, etc.), which is only used for --help <flag>
    option =>
      !(
        option.type === "boolean" &&
        option.oppositeDescription &&
        !option.name.startsWith("no-")
      )
  );

  const groupedOptions = groupBy(options, option => option.category);

  const firstCategories = categoryOrder.slice(0, -1);
  const lastCategories = categoryOrder.slice(-1);
  const restCategories = Object.keys(groupedOptions).filter(
    category =>
      firstCategories.indexOf(category) === -1 &&
      lastCategories.indexOf(category) === -1
  );
  const allCategories = firstCategories.concat(restCategories, lastCategories);

  const optionsUsage = allCategories.map(category => {
    const categoryOptions = groupedOptions[category]
      .map(option =>
        createOptionUsage(
          option,
          threshold,
          detailedOptionMap,
          apiDefaultOptions
        )
      )
      .join("\n");
    return `${category} options:\n\n${indent(categoryOptions, 2)}`;
  });

  return [usageSummary].concat(optionsUsage, [""]).join("\n\n");
}

module.exports = {
  indent,
  groupBy,
  createLogger,
  normalizeDetailedOptionMap,
  createMinimistOptions,
  createDetailedOptionMap,
  createApiDetailedOptionMap,
  flattenArray,
  createDiff,
  getOptionDefaultValue,
  createOptionUsageHeader,
  createDefaultValueDisplay,
  createOptionUsageRow,
  createChoiceUsages,
  createOptionUsage,
  getOptionsWithOpposites,
  createUsage
};
