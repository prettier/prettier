#!/usr/bin/env node

"use strict";

const path = require("path");
const testDir = require("./test-dir");

const code = testDir({
  dir: path.join(__dirname, "../dist"),
  prettierDir: "",
  isProduction: true
});

process.exit(code);
