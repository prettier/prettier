#!/usr/bin/env node

"use strict";

const markdownMagic = require("markdown-magic");
const path = require("path");
const cliUtil = require("../src/cli-util");
const detailedOptions = require("../src/cli-constant").detailedOptions;

const files = ["../docs/options.md", "../README.md"].map(x =>
  path.resolve(__dirname, x)
);

const config = {
  transforms: {
    PRETTIER_OPTIONS(_, options) {
      return detailedOptions
        .filter(option => option.category === "Format")
        .filter(option => !option.deprecated)
        .map(detailedOption =>
          formatOption(
            detailedOption,
            options.headingLevel ? +options.headingLevel : 1
          )
        )
        .join("\n");
    }
  }
};

markdownMagic(files, config);

function formatOption(detailedOption, headingLevel) {
  const header = "#".repeat(headingLevel) + ` ${detailedOption.name}`;
  const usageType = cliUtil.createOptionUsageType(detailedOption);
  return [
    header,
    detailedOption.description,
    "",
    "Default | CLI Override | API Override",
    "--------|--------------|-------------",
    [
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
    ].join(" | "),
    ""
  ].join("\n");
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
