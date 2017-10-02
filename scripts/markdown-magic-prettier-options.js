"use strict";

const humanize = require("humanize-string");
const babylon = require("babylon");
const path = require("path");
const fs = require("fs");

const cliUtil = require("../src/cli-util");
const detailedOptions = require("../src/cli-constant").detailedOptions;
const optionDocs = extractDocumentationFromFile(
  path.resolve(__dirname, "../src/options-definitions.js")
);

module.exports = (_, options) => {
  return detailedOptions
    .filter(option => option.forwardToApi)
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

  const defaultValue = cliUtil.getOptionDefaultValue(detailedOption.name);

  const name = {
    cli: cliUtil.getOptionName(detailedOption, "cli"),
    api: cliUtil.getOptionName(detailedOption, "api")
  };

  const tableRow = [
    serialize(defaultValue),
    // CLI Override
    backtick(
      (defaultValue === true ? name.cli.replace("--", "--no-") : name.cli) +
        (usageType ? ` ${usageType}` : "")
    ),
    // API Override
    backtick(name.api + `: ${usageType ? usageType : "<bool>"}`)
  ].join(" | ");

  return [header, description, choices, [tableHeader, tableRow].join("\n")]
    .filter(Boolean)
    .join("\n\n");
}

// https://github.com/chjj/marked/issues/285
function backtick(string) {
  if (string.includes("|")) {
    return `<code>${string
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\|/g, "&#124;")}</code>`;
  }
  return `\`${string}\``;
}

function serialize(thing) {
  switch (typeof thing) {
    case "undefined":
      return "N/A";
    case "number":
      return backtick(thing.toString());
    default:
      return backtick(JSON.stringify(thing));
  }
}

function extractDocumentationFromFile(fsPath) {
  const definitions = babylon.parse(fs.readFileSync(fsPath, "utf8"));

  const statement = definitions.program.body.find(
    item =>
      item.type === "ExpressionStatement" &&
      item.expression.type === "AssignmentExpression" &&
      item.expression.left.type === "MemberExpression" &&
      item.expression.left.object.name === "module"
  );

  return statement.expression.right.properties.reduce((obj, property) => {
    if (
      property.leadingComments &&
      property.leadingComments[0].type === "CommentBlock"
    ) {
      obj[
        property.key.value || property.key.name
      ] = property.leadingComments[0].value
        .replace(/\\\//g, "/")
        .replace(/^\s*\*\s/gm, "");
    }
    return obj;
  }, {});
}
