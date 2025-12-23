"use strict";

const path = require("node:path");
const IS_CI = Boolean(process.env.CI);

module.exports = {
  // Will download when execute
  skipDownload: !IS_CI,
  cacheDirectory: IS_CI ? path.join(__dirname, "./.tmp/puppeteer/") : undefined,
};
