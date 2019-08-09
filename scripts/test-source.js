#!/usr/bin/env node

"use strict";

const path = require("path");
const testDir = require("./test-dir");

const code = testDir({
  dir: path.join(__dirname, ".."),
  isProduction: false
});

process.exit(code);
