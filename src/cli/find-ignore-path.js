"use strict";

const path = require("path");
const fs = require("fs");

const { printToScreen } = require("./utils.js");

let prettierIgnoreExists = false;

function findIgnorePath() {
  const folder = process.cwd();
  for (const file of fs.readdirSync(folder)) {
    if (file === ".prettierignore") {
      prettierIgnoreExists = true;
    }
  }

  if (prettierIgnoreExists) {
    const prettierIgnorePath = path.join(process.cwd(), ".prettierignore");
    return printToScreen(prettierIgnorePath);
  }
  new Error(`Can not find ignore file for "${process.cwd()}"`);
  return process.exit(1);
}

module.exports = findIgnorePath;
