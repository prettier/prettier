"use strict";

const fs = require("fs");

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (e) {
    return false;
  }
}

module.exports = isDirectory;
