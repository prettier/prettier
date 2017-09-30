#!/usr/bin/env node

"use strict";

const markdownMagic = require("markdown-magic");
const path = require("path");

const files = ["../docs/options.md", "../README.md"].map(x =>
  path.resolve(__dirname, x)
);

const config = {
  transforms: {
    PRETTIER_OPTIONS: require("./markdown-magic-prettier-options")
  }
};

markdownMagic(files, config);
