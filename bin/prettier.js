#!/usr/bin/env node

"use strict";
const fs = require("fs");
const getStdin = require("get-stdin");
const glob = require("glob");
const minimist = require("minimist");
const prettier = require("../index");

const argv = minimist(process.argv.slice(2), {
  boolean: [
    "write",
    "stdin",
    "single-quote",
    "trailing-comma",
    "bracket-spacing",
    // See https://github.com/chalk/supports-color/#info
    "color",
    "version",
    "debug-print-doc",
    // Deprecated in 0.0.10
    "flow-parser"
  ],
  string: [ "print-width", "tab-width", "parser" ],
  default: { color: true, "bracket-spacing": true, parser: "babylon" },
  unknown: param => {
    if (param.startsWith("-")) {
      console.warn("Ignored unknown option: " + param + "\n");
    }
  }
});

if (argv["version"]) {
  console.log(prettier.version);
  process.exit(0);
}

const filepatterns = argv["_"];
const write = argv["write"];
const stdin = argv["stdin"];

if (!filepatterns.length && !stdin) {
  console.log(
    "Usage: prettier [opts] [filename ...]\n\n" +
      "Available options:\n" +
      "  --write                  Edit the file in-place. (Beware!)\n" +
      "  --stdin                  Read input from stdin.\n" +
      "  --print-width <int>      Specify the length of line that the printer will wrap on. Defaults to 80.\n" +
      "  --tab-width <int>        Specify the number of spaces per indentation-level. Defaults to 2.\n" +
      "  --single-quote           Use single quotes instead of double.\n" +
      "  --trailing-comma         Print trailing commas wherever possible.\n" +
      "  --bracket-spacing        Put spaces between brackets. Defaults to true.\n" +
      "  --parser <flow|babylon>  Specify which parse to use. Defaults to babylon.\n" +
      "  --color                  Colorize error messages. Defaults to true.\n" +
      "  --version                Print prettier version.\n" +
      "\n" +
      "Boolean options can be turned off like this:\n" +
      "  --no-bracket-spacing\n" +
      "  --bracket-spacing=false"
  );
  process.exit(1);
}

function getParser() {
  // For backward compatibility. Deprecated in 0.0.10
  if (argv["flow-parser"]) {
    console.warn("`--flow-parser` is deprecated. Use `--parser flow` instead.");
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
    const doc = prettier.__debug.printToDoc(input, options);
    return prettier.__debug.formatDoc(doc);
  }
  return prettier.format(input, options);
}

if (stdin) {
  getStdin().then(input => {
    try {
      console.log(format(input));
    } catch (e) {
      process.exitCode = 2;
      console.error("stdin: " + e);
      return;
    }
  });
} else {
  eachFilename(filepatterns, filename => {
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
        console.error(filename + ": " + e);
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

function eachFilename(patterns, callback) {
  patterns.forEach(pattern => {
    glob(pattern, (err, filenames) => {
      if (err) {
        console.error("Unable to expand glob pattern: " + pattern + "\n" + err);
        // Don't exit the process if one pattern failed
        process.exitCode = 2;
        return;
      }

      filenames.forEach(filename => {
        callback(filename);
      });
    });
  });
}
