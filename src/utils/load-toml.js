"use strict";

const toml = require("@iarna/toml");

module.exports = function(filePath, content) {
  try {
    return toml.parse(content);
  } catch (error) {
    error.message = `TOML Error in ${filePath}:\n${error.message}`;
    throw error;
  }
};
