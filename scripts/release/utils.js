"use strict";

const fs = require("fs");

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

module.exports = {
  readJson
};
