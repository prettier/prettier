"use strict";

require("readline").emitKeypressEvents(process.stdin);

const fs = require("fs");
const chalk = require("chalk");
const execa = require("execa");
const stringWidth = require("string-width");

const OK = chalk.bgGreen.black(" DONE ");
const FAIL = chalk.bgRed.black(" FAIL ");

const fitTerminal = (input) => {
  const columns = Math.min(process.stdout.columns, 80);
  const WIDTH = columns - stringWidth(OK) + 1;
  if (input.length < WIDTH) {
    input += chalk.dim(".").repeat(WIDTH - input.length - 1);
  }
  return input;
};

const logPromise = (name, promise) => {
  process.stdout.write(fitTerminal(name));

  return promise
    .then((result) => {
      process.stdout.write(`${OK}\n`);
      return result;
    })
    .catch((err) => {
      process.stdout.write(`${FAIL}\n`);
      throw err;
    });
};

const runYarn = (script) => {
  if (typeof script === "string") {
    script = [script];
  }
  return execa("yarn", ["--silent"].concat(script)).catch((error) => {
    throw new Error(`\`yarn ${script}\` failed\n${error.stdout}`);
  });
};

const waitForEnter = () => {
  process.stdin.setRawMode(true);

  return new Promise((resolve, reject) => {
    process.stdin.on("keypress", listener);
    process.stdin.resume();

    const listener = (ch, key) => {
      if (key.name === "return") {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", listener);
        process.stdin.pause();
        resolve();
      } else if (key.ctrl && key.name === "c") {
        reject(new Error("Process terminated by the user"));
      }
    };
  });
};

const readJson = (filename) => JSON.parse(fs.readFileSync(filename, "utf-8"));

const writeJson = (filename, content) => {
  fs.writeFileSync(filename, JSON.stringify(content, null, 2) + "\n");
};

const processFile = (filename, fn) => {
  const content = fs.readFileSync(filename, "utf-8");
  fs.writeFileSync(filename, fn(content));
};

module.exports = {
  runYarn,
  logPromise,
  processFile,
  readJson,
  writeJson,
  waitForEnter,
};
