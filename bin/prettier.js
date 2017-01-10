#!/usr/bin/env node
"use strict";

const fs = require("fs");
const minimist = require("minimist");
const jscodefmt = require("../index");

const argv = minimist(process.argv.slice(2), {
  boolean: ["write", "flow-parser", "bracket-spacing", "single-quote", "trailing-comma"],
  default: {
    "bracket-spacing": true
  }
});

const filename = argv["_"][0];
const write = argv['write'];

if(!filename || !filename.match(/\S/)) {
  console.log(
    "Usage: prettier [opts] [filename]\n\n" +
    "Available options:\n" +
    "  --write              Edit the file in-place (beware!)\n" +
    "  --print-width <int>  Specify the length of line that the printer will wrap on. Defaults to 80.\n" +
    "  --tab-width <int>    Specify the number of spaces per indentation-level. Defaults to 2.\n" +
    "  --flow-parser        Use the flow parser instead of babylon\n" +
    "  --single-quote       Use single quotes instead of double\n" +
    "  --trailing-comma     Print trailing commas wherever possible\n" +
    "  --bracket-spacing    Put spaces between brackets. Defaults to true, set false to turn off"
  );
  process.exit(1);
}

let input;
try {
  input = fs.readFileSync(filename, "utf8")
}
catch(e) {
  console.log("Unable to read file: " + filename);
  process.exit(2);
}

const output = jscodefmt.format(input, {
  printWidth: argv['print-width'],
  tabWidth: argv['tab-width'],
  bracketSpacing: argv['bracket-spacing'],
  useFlowParser: argv['flow-parser'],
  singleQuote: argv["single-quote"],
  trailingComma: argv["trailing-comma"]
});

if(write) {
  fs.writeFileSync(filename, output, "utf8");
}
else {
  console.log(output);
}
