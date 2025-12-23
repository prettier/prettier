"use strict";

const path = require("node:path");

module.exports = {
  // Will download when execute
  skipDownload: true,
  cacheDirectory: path.join(__dirname, "./.tmp/puppeteer/"),
};
