"use strict";

const fs = require("fs");

module.exports = function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (e) {
    return false;
  }
};
