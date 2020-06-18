"use strict";

// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

const fs = require("fs");
const path = require("path");

const MARKERS = new Set([".git", ".hg"]);

const markerExists = (directory) =>
  fs.existsSync(directory) &&
  fs.readdirSync(directory).some((file) => MARKERS.has(file));

function findProjectRoot(directory) {
  while (!markerExists(directory)) {
    const parentDirectory = path.resolve(directory, "..");
    if (parentDirectory === directory) {
      break;
    }
    directory = parentDirectory;
  }

  return directory;
}

module.exports = findProjectRoot;
