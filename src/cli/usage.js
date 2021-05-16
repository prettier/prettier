"use strict";

const groupBy = require("lodash/groupBy");
const camelCase = require("camelcase");
const constant = require("./constant");

const OPTION_USAGE_THRESHOLD = 25;
const CHOICE_USAGE_MARGIN = 3;
const CHOICE_USAGE_INDENTATION = 2;

function indent(str, spaces) {
  return str.replace(/^/gm, " ".repeat(spaces));
}

function createDefaultValueDisplay(value) {
  return Array.isArray(value)
    ? `[${value.map(createDefaultValueDisplay).join(", ")}]`
    : value;
}

function getOptionDefaultValue(context, optionName) {
  // --no-option
  if (!(optionName in context.detailedOptionMap)) {
    return;
  }

  const option = context.detailedOptionMap[optionName];

  if (option.default !== undefined) {
    return option.default;
  }

  const optionCamelName = camelCase(optionName);
  if (optionCamelName in context.apiDefaultOptions) {
    return context.apiDefaultOptions[optionCamelName];
  }
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
        .filter((choice) => !choice.deprecated && choice.since !== null)
        .map((choice) => choice.value)
        .join("|")}>`;
    default:
      return `<${option.type}>`;
  }
}

function createChoiceUsages(choices, margin, indentation) {
  const activeChoices = choices.filter(
    (choice) => !choice.deprecated && choice.since !== null
  );
  const threshold =
    Math.max(0, ...activeChoices.map((choice) => choice.value.length)) + margin;
  return activeChoices.map((choice) =>
    indent(
      createOptionUsageRow(choice.value, choice.description, threshold),
      indentation
    )
  );
}

function createOptionUsage(context, option, threshold) {
  const header = createOptionUsageHeader(option);
  const optionDefaultValue = getOptionDefaultValue(context, option.name);
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
  const optionsWithOpposites = options.map((option) => [
    option.description ? option : null,
    option.oppositeDescription
      ? {
          ...option,
          name: `no-${option.name}`,
          type: "boolean",
          description: option.oppositeDescription,
        }
      : null,
  ]);
  return optionsWithOpposites.flat().filter(Boolean);
}

function createUsage(context) {
  const options = getOptionsWithOpposites(context.detailedOptions).filter(
    // remove unnecessary option (e.g. `semi`, `color`, etc.), which is only used for --help <flag>
    (option) =>
      !(
        option.type === "boolean" &&
        option.oppositeDescription &&
        !option.name.startsWith("no-")
      )
  );

  const groupedOptions = groupBy(options, (option) => option.category);

  const firstCategories = constant.categoryOrder.slice(0, -1);
  const lastCategories = constant.categoryOrder.slice(-1);
  const restCategories = Object.keys(groupedOptions).filter(
    (category) => !constant.categoryOrder.includes(category)
  );
  const allCategories = [
    ...firstCategories,
    ...restCategories,
    ...lastCategories,
  ];

  const optionsUsage = allCategories.map((category) => {
    const categoryOptions = groupedOptions[category]
      .map((option) =>
        createOptionUsage(context, option, OPTION_USAGE_THRESHOLD)
      )
      .join("\n");
    return `${category} options:\n\n${indent(categoryOptions, 2)}`;
  });

  return [constant.usageSummary, ...optionsUsage, ""].join("\n\n");
}

function createDetailedUsage(context, flag) {
  const option = getOptionsWithOpposites(context.detailedOptions).find(
    (option) => option.name === flag || option.alias === flag
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

  const optionDefaultValue = getOptionDefaultValue(context, option.name);
  const defaults =
    optionDefaultValue !== undefined
      ? `\n\nDefault: ${createDefaultValueDisplay(optionDefaultValue)}`
      : "";

  const pluginDefaults =
    option.pluginDefaults && Object.keys(option.pluginDefaults).length > 0
      ? `\nPlugin defaults:${Object.entries(option.pluginDefaults).map(
          ([key, value]) => `\n* ${key}: ${createDefaultValueDisplay(value)}`
        )}`
      : "";
  return `${header}${description}${choices}${defaults}${pluginDefaults}`;
}

module.exports = {
  createUsage,
  createDetailedUsage,
};
