"use strict";

const ignore = require("ignore");
const fs = require("fs");
const path = require("path");

function createIgnorer(ignorePath, withNodeModules) {
  let ignoreText = "";

  if (ignorePath) {
    const resolvedIgnorePath = path.resolve(ignorePath);
    try {
      ignoreText = fs.readFileSync(resolvedIgnorePath, "utf8");
    } catch (readError) {
      if (readError.code !== "ENOENT") {
        throw new Error(
          `Unable to read ${resolvedIgnorePath}: ${readError.message}`
        );
      }
    }
  }

  const ignorer = ignore().add(ignoreText);
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
