"use strict";

const dedent = require("dedent");
const dashify = require("dashify");
const getSupportInfo = require("../common/support").getSupportInfo;
const options = require("./options");
const commonUtil = require("../common/util");
const util = require("./util");

const CATEGORY_CONFIG = "Config";
const CATEGORY_EDITOR = "Editor";
const CATEGORY_FORMAT = "Format";
const CATEGORY_OTHER = "Other";
const CATEGORY_OUTPUT = "Output";

const categoryOrder = [
  CATEGORY_OUTPUT,
  CATEGORY_FORMAT,
  CATEGORY_CONFIG,
  CATEGORY_EDITOR,
  CATEGORY_OTHER
];

const detailedOptionMap = util.normalizeDetailedOptionMap(
  Object.assign(
    getSupportInfo(null, {
      showDeprecated: true,
      showUnreleased: true,
      showInternal: true
    }).options.reduce((reduced, option) => {
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
    }, {}),
    options
  )
);

const detailedOptions = commonUtil.arrayify(detailedOptionMap, "name");
const minimistOptions = util.createMinimistOptions(detailedOptions);

const usageSummary = dedent`
  Usage: prettier [options] [file/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

const apiDetailedOptionMap = util.createApiDetailedOptionMap(detailedOptions);

module.exports = {
  categoryOrder,
  minimistOptions,
  detailedOptions,
  detailedOptionMap,
  apiDetailedOptionMap,
  usageSummary
};
