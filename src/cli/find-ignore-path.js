"use strict";

const path = require("path");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");
const { printToScreen } = require("./utils.js");

async function findIgnorePath(context) {
  const prettierIgnorePath = path.join(process.cwd(), ".prettierignore");
  const prettierIgnoreExists = await prettier.resolveConfig(
    prettierIgnorePath,
    {
      editorconfig: false,
      config: false,
      ignorePath: true,
    }
  );
  if (prettierIgnoreExists) {
    printToScreen(prettierIgnorePath);
  } else {
    throw new Error(`Can not find ignore file for "${context.cwd}"`);
  }
}

module.exports = findIgnorePath;
