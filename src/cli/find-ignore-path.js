"use strict";

const path = require("path");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");
const { printToScreen } = require("./utils.js");

async function findIgnorePath(context) {
  let prettierIgnorePath = path.join(process.cwd(), ".prettierignore");
  prettierIgnorePath = prettierIgnorePath.replace(/[^/]*$/, "");
  prettierIgnorePath = path.join(prettierIgnorePath, ".prettierignore");

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
    new Error(`Can not find ignore file for "${context.cwd}"`);
    return process.exit(1);
  }
}

module.exports = findIgnorePath;
