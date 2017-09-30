"use strict";

const humanize = require("humanize-string");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");

const cliUtil = require("../src/cli-util");
const detailedOptions = require("../src/cli-constant").detailedOptions;
const optionDocs = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, "../docs/options.yaml"))
);

module.exports = (_, options) => {
  return detailedOptions
    .filter(option => option.category === "Format")
    .filter(option => !option.deprecated)
    .map(detailedOption =>
      formatOption(
        detailedOption,
        options.headingLevel ? +options.headingLevel : 1
      )
    )
    .join("\n\n");
};

function formatOption(detailedOption, headingLevel) {
  const header = "#".repeat(headingLevel) + ` ${humanize(detailedOption.name)}`;
  const usageType = cliUtil.createOptionUsageType(detailedOption);

  const description = [
    detailedOption.description,
    optionDocs[detailedOption.name]
  ]
    .filter(Boolean)
    .join("\n\n");

  const choices =
    detailedOption.choices && detailedOption.choices.length
      ? "Valid options:\n\n" +
        cliUtil
          .createChoiceUsages(detailedOption.choices || [], 2, 0)
          .map(choice => `* ${choice.replace(/^([^ ])*/, backtick)}`)
          .join("\n")
      : "";

  const tableHeader = [
    "",
    "Default | CLI Override | API Override",
    "--------|--------------|-------------"
  ].join("\n");

  const tableRow = [
    backtick(
      JSON.stringify(cliUtil.getOptionDefaultValue(detailedOption.name))
    ),
    backtick(
      cliUtil.getOptionName(detailedOption, "cli") +
        (usageType ? ` ${usageType}` : "")
    ),
    backtick(
      cliUtil.getOptionName(detailedOption, "api") +
        `: ${usageType ? usageType : "<bool>"}`
    )
  ].join(" | ");

  return [header, description, choices, [tableHeader, tableRow].join("\n")]
    .filter(Boolean)
    .join("\n\n");
}

// https://github.com/chjj/marked/issues/285
function backtick(string) {
  if (string.indexOf("|") > -1) {
    return `<code>${string
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\|/g, "&#124;")}</code>`;
  }
  return `\`${string}\``;
}
