"use strict";

const path = require("path");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");

async function logResolvedConfigPathOrDie(context) {
  const file = context.argv.findConfigPath;
  const configFile = await prettier.resolveConfigFile(file);
  if (configFile) {
    context.logger.log(path.relative(process.cwd(), configFile));
  } else {
    throw new Error(`Can not find configure file for "${file}"`);
  }
}

module.exports = logResolvedConfigPathOrDie;
