"use strict";

const path = require("path");
const fs = require("fs");

const { printToScreen } = require("./utils.js");

let prettierIgnoreExists = false;

function cleanPrettierIgnorePath() {
  let prettierIgnorePath = path.join(process.cwd(), ".prettierignore");
  prettierIgnorePath = path.relative(
    path.join(process.cwd(), ".."),
    prettierIgnorePath
  );
  prettierIgnorePath = `./${prettierIgnorePath}`;
  prettierIgnorePath = prettierIgnorePath.replace("\\", "/");
  return prettierIgnorePath;
}

function findIgnorePath() {
  const folder = process.cwd();
  for (const file of fs.readdirSync(folder)) {
    if (file === ".prettierignore") {
      prettierIgnoreExists = true;
    }
  }
  if (prettierIgnoreExists) {
    const path = cleanPrettierIgnorePath();
    printToScreen(path);
  }
  const errorPath = cleanPrettierIgnorePath();
  throw new Error(`Can not find ignore file for "${errorPath}"`);
}

module.exports = findIgnorePath;
