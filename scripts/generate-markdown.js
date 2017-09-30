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
    "`" +
      JSON.stringify(cliUtil.getOptionDefaultValue(detailedOption.name)) +
      "` | `" +
      cliUtil.getOptionName(detailedOption, "cli") +
      (usageType ? ` ${usageType}` : "") +
      "` | `" +
      cliUtil.getOptionName(detailedOption, "api") +
      `: ${usageType ? usageType : "<bool>"}` +
      "`",
    ""
  ].join("\n");
}
