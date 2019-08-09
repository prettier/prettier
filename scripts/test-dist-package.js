#!/usr/bin/env node

"use strict";

const path = require("path");
const testPackage = require("./package-test");

const code = testPackage({
  dir: path.join(__dirname, "../dist"),
  isProduction: true,
  unitTest: true,
  integrationTest: true
});

process.exit(code);
