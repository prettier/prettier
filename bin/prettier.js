#!/usr/bin/env node

"use strict";
const fs = require("fs");
const getStdin = require("get-stdin");
const minimist = require("minimist");
const jscodefmt = require("../index");

const argv = minimist(process.argv.slice(2), {
  boolean: [
    "write",
    "stdin",
    "bracket-spacing",
    "single-quote",
    "trailing-comma",
    "version",
    "debug-print-doc",
    // Deprecated in 0.0.10
    "flow-parser"
  ],
  string: [ "parser" ],
  default: { "bracket-spacing": true, parser: "babylon" },
  unknown: param => {
    if (param.startsWith("-")) {
      console.error("Unknown option: " + param + "\n");
      process.exit(2);
    }
  }
});

if (argv["version"]) {
  console.log(jscodefmt.version);
  process.exit(0);
}

const filenames = argv["_"];
const write = argv["write"];
const stdin = argv["stdin"];

if (!filenames.length && !stdin) {
  console.log(
    "Usage: prettier [opts] [filename ...]\n\n" +
      "Available options:\n" +
      "  --write                  Edit the file in-place (beware!)\n" +
      "  --stdin                  Read input from stdin\n" +
      "  --print-width <int>      Specify the length of line that the printer will wrap on. Defaults to 80.\n" +
      "  --tab-width <int>        Specify the number of spaces per indentation-level. Defaults to 2.\n" +
      "  --parser <flow|babylon>  Specify which parse to use. Defaults to babylon\n" +
      "  --single-quote           Use single quotes instead of double\n" +
      "  --trailing-comma         Print trailing commas wherever possible\n" +
      "  --bracket-spacing        Put spaces between brackets. Defaults to true, set false to turn off"
  );
  process.exit(1);
}

function getParser() {
  // For backward compatibility. Deprecated in 0.0.10
  if (argv["flow-parser"]) {
    return "flow";
  }

  if (argv["parser"] === "flow") {
    return "flow";
  }

  return "babylon";
}

const options = {
  printWidth: argv["print-width"],
  tabWidth: argv["tab-width"],
  bracketSpacing: argv["bracket-spacing"],
  parser: getParser(),
  singleQuote: argv["single-quote"],
  trailingComma: argv["trailing-comma"]
};

function format(input) {
  if (argv["debug-print-doc"]) {
    const doc = jscodefmt.__debug.printToDoc(input, options);
    return jscodefmt.__debug.formatDoc(doc);
  }
  return jscodefmt.format(input, options);
}

if (stdin) {
  getStdin().then(input => {
    try {
      console.log(format(input));
    } catch (e) {
      process.exitCode = 2;
      console.error(e);
      return;
    }
  });
} else {
  filenames.forEach(filename => {
    fs.readFile(filename, "utf8", (err, input) => {
      if (write) {
        console.log(filename);
      }

      if (err) {
        console.error("Unable to read file: " + filename + "\n" + err);
        // Don't exit the process if one file failed
        process.exitCode = 2;
        return;
      }

      let output;
      try {
        output = format(input);
      } catch (e) {
        process.exitCode = 2;
        console.error(e);
        return;
      }

      if (write) {
        fs.writeFile(filename, output, "utf8", err => {
          if (err) {
            console.error("Unable to write file: " + filename + "\n" + err);
            // Don't exit the process if one file failed
            process.exitCode = 2;
          }
        });
      } else {
        console.log(output);
      }
    });
  });
}
