#!/usr/bin/env node

"use strict";

const markdownMagic = require("markdown-magic");
const path = require("path");
const fs = require("fs");

const README_PATH = path.resolve(__dirname, "../README.md");
const DOCS_PATH = path.resolve(__dirname, "../docs");
const DOCS_FILES = fs
  .readdirSync(DOCS_PATH)
  .map(file => path.join(DOCS_PATH, file));

const readme = fs.readFileSync(README_PATH, "utf8");

const config = {
  transforms: {
    PRETTIER_DOCS: (_, options) => {
      return extractSection(readme, options.id).replace(/^(#+)#/gm, "$1");
    }
  }
};

markdownMagic([README_PATH].concat(DOCS_FILES), config);

function extractSection(contents, id) {
  const start = `<!-- START (${id}) -->`;
  const stop = "<!-- END -->";

  const startIndex = contents.indexOf(start);
  const stopIndex = contents.indexOf(stop, startIndex);

  if (startIndex < 0 || stopIndex < 0) {
    throw new Error(`Couldn't find ${start} or ${stop}`);
  }

  return contents.substring(startIndex + start.length, stopIndex);
}
