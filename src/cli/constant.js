"use strict";

const dedent = require("dedent");
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
    {},
    util.createDetailedOptionMap(
      getSupportInfo(null, {
        showDeprecated: true,
        showUnreleased: true,
        showInternal: true
      }).options
    ),
    options
  )
);

const detailedOptions = commonUtil.arrayify(detailedOptionMap, "name");
const minimistOptions = util.createMinimistOptions(detailedOptions);
const apiDetailedOptionMap = util.createApiDetailedOptionMap(detailedOptions);

const usageSummary = dedent`
  Usage: prettier [options] [file/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

module.exports = {
  apiDetailedOptionMap,
  categoryOrder,
  detailedOptionMap,
  detailedOptions,
  minimistOptions,
  usageSummary
};
