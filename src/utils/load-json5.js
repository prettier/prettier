"use strict";

const { parse } = require("json5");

module.exports = function (filePath, content) {
  try {
    return parse(content);
  } catch (error) {
    error.message = `JSON5 Error in ${filePath}:\n${error.message}`;
    throw error;
  }
};
