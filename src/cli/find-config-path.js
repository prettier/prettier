"use strict";

const path = require("path");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");
const { printToScreen } = require("./utils.js");

async function logResolvedConfigPathOrDie(context) {
  const file = context.argv.findConfigPath;
  const configFile = await prettier.resolveConfigFile(file);
  if (configFile) {
    printToScreen(path.relative(process.cwd(), configFile));
  } else {
    throw new Error(`Can not find configure file for "${file}"`);
  }
}

module.exports = logResolvedConfigPathOrDie;
