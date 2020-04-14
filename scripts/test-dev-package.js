#!/usr/bin/env node

"use strict";

const path = require("path");
const testPackage = require("./package-test");
const { NPM_CLIENT } = process.env;

const code = testPackage({
  dir: path.join(__dirname, ".."),
  isProduction: false,
  client: NPM_CLIENT,
});

process.exit(code);
