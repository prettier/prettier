#!/usr/bin/env node

"use strict";

const markdownMagic = require("markdown-magic");
const path = require("path");
const camelCase = require("camelcase");
const getOptionDefaultValue = require("../src/cli-util").getOptionDefaultValue;
const detailedOptions = require("../src/cli-constant").detailedOptions;

const optionsFilePath = path.resolve(__dirname, "../docs/options.md");

const config = {
  transforms: {
    renderOptions(_, options) {
      return detailedOptions
        .filter(option => option.category === "Format")
        .map(detailedOption => {
          return formatOption(detailedOption, +options.headingLevel);
        })
        .join("\n");
    }
  }
};

markdownMagic([optionsFilePath], config, () => {});

function formatOption(detailedOption, headingLevel) {
  const header = "#".repeat(headingLevel) + ` ${detailedOption.name}`;
  return [
    header,
    detailedOption.description,
    "",
    "Default | CLI Override | API Override",
    "--------|--------------|-------------",
    "`" +
      JSON.stringify(getOptionDefaultValue(detailedOption.name)) +
      "` | `--" +
      detailedOption.name +
      "` | `" +
      camelCase(detailedOption.name) +
      "`"
  ].join("\n");

  // ## Tab Width
  // Specify the number of spaces per indentation-level.

  // Default | CLI Override | API Override
  // --------|--------------|-------------
  //  `2` | `--tab-width <int>` | `tabWidth: <int>`
}
