"use strict";

const parse = require("@iarna/toml/parse-string");

/**
 * @param {string} filePath
 * @param {string} content
 */
module.exports = function (filePath, content) {
  try {
    return parse(content);
  } catch (error) {
    error.message = `TOML Error in ${filePath}:\n${error.message}`;
    throw error;
  }
};
