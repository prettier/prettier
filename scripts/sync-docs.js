#!/usr/bin/env node

"use strict";

const markdownMagic = require("markdown-magic");
const path = require("path");
const fs = require("fs");

const README_PATH = path.resolve(__dirname, "../README.md");
const OPTIONS_PATH = path.resolve(__dirname, "../docs/options.md");

const config = {
  transforms: {
    PRETTIER_OPTIONS: () => {
      const readme = fs.readFileSync(README_PATH, "utf8");
      return extractOptions(readme).replace(/^(#+)#/gm, "$1");
    }
  }
};

markdownMagic([README_PATH, OPTIONS_PATH], config);

function extractOptions(contents) {
  const OPTIONS_START = "<!-- OPTIONS-START -->";
  const OPTIONS_STOP = "<!-- OPTIONS-STOP -->";

  const startIndex = contents.indexOf(OPTIONS_START);
  const stopIndex = contents.indexOf(OPTIONS_STOP);

  if (startIndex < 0 || stopIndex < 0) {
    throw new Error(`Couldn't find ${OPTIONS_START} or ${OPTIONS_STOP}`);
  }

  return contents.substring(startIndex + OPTIONS_START.length, stopIndex);
}
