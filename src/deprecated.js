"use strict";

const chalk = require('chalk'); // "chalk" comes with jest-validate
const bold = chalk
  ? chalk.bold
  : value => value; // fallback when chalk is not available (e.g. for npm 2)

const deprecated = {
  useFlowParser: config =>
`  The ${bold("\"useFlowParser\"")} option is deprecated. Use ${bold("\"parser\"")} instead.

  Prettier now treats your configuration as:
  {
    ${bold("\"parser\"")}: ${bold(config.seFlowParser ? "\"flow\"" : "\"babylon\"")}
  }`
};

module.exports = deprecated;
