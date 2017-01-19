#!/usr/bin/env node

"use strict";
const fs = require("fs");
const getStdin = require("get-stdin");
const minimist = require("minimist");
const jscodefmt = require("../index");

const argv = minimist(process.argv.slice(2), {
  boolean: [
    "write",
    "check",
    "stdin",
    "flow-parser",
    "bracket-spacing",
    "single-quote",
    "trailing-comma",
    "version"
  ],
  default: { "bracket-spacing": true }
});

if (argv["version"]) {
  console.log(jscodefmt.version);
  process.exit(0);
}

const filenames = argv["_"];
const write = argv["write"];
const check = argv["check"];
const stdin = argv["stdin"];

if (!filenames.length && !stdin) {
  console.log(
    "Usage: prettier [opts] [filename ...]\n\n" +
      "Available options:\n" +
      "  --write              Edit the file in-place (beware!)\n" +
      "  --stdin              Read input from stdin\n" +
      "  --print-width <int>  Specify the length of line that the printer will wrap on. Defaults to 80.\n" +
      "  --tab-width <int>    Specify the number of spaces per indentation-level. Defaults to 2.\n" +
      "  --flow-parser        Use the flow parser instead of babylon\n" +
      "  --single-quote       Use single quotes instead of double\n" +
      "  --trailing-comma     Print trailing commas wherever possible\n" +
      "  --bracket-spacing    Put spaces between brackets. Defaults to true, set false to turn off" +
      "  --check              Ensure the file is correctly pretty-printed\n"
  );
  process.exit(1);
}

function format(input) {
  return jscodefmt.format(input, {
    printWidth: argv["print-width"],
    tabWidth: argv["tab-width"],
    bracketSpacing: argv["bracket-spacing"],
    useFlowParser: argv["flow-parser"],
    singleQuote: argv["single-quote"],
    trailingComma: argv["trailing-comma"]
  });
}

if (stdin) {
  getStdin().then(input => {
    try {
      console.log(format(input));
    } catch (e) {
      process.exitCode = 2;
      console.log(e);
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
        console.log("Unable to read file: " + filename + "\n" + err);
        // Don't exit the process if one file failed
        process.exitCode = 2;
        return;
      }

      let output;
      try {
        output = format(input);
      } catch (e) {
        process.exitCode = 2;
        if (check) {
          console.log(filename);
        }
        console.log(e);
        return;
      }

      if (check) {
        let output2;
        try {
          output2 = format(output);
        } catch (e) {
          function padLeft(nr, n, str){
            return Array(n-String(nr).length+1).join(str||'0')+nr;
          }
          console.log(filename);
          process.exitCode = 2;
          const match = e.toString().match(/\(([0-9]+):/);
          if (match) {
            const line = +match[1];
            const context = 8;
            let i = Math.max(line - context, 0);
            console.log(
              output
                .split('\n')
                .slice(i, line + context)
                .map(line => padLeft('' + (i++), 4, ' ') + ' | ' + line)
                .join('\n')
              );
          }
          console.log(e);
          return;
        }

        if (output !== output2) {
          var diff = require('diff').createTwoFilesPatch(filename, filename, output, output2, '', '', {context: 2});
          console.log(diff);
        }
      }

      if (write) {
        fs.writeFile(filename, output, "utf8", err => {
          if (err) {
            console.log("Unable to write file: " + filename + "\n" + err);
            // Don't exit the process if one file failed
            process.exitCode = 2;
          }
        });
      } else if (!check) {
        console.log(output);
      }
    });
  });
}
