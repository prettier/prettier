"use strict";

require("readline").emitKeypressEvents(process.stdin);

const chalk = require("chalk");
const fs = require("fs");
const execa = require("execa");
const stringWidth = require("string-width");

const OK = chalk.bgGreen.black(" DONE ");
const FAIL = chalk.bgRed.black(" FAIL ");

function fitTerminal(input) {
  const columns = Math.min(process.stdout.columns, 80);
  const WIDTH = columns - stringWidth(OK) + 1;
  if (input.length < WIDTH) {
    input += Array(WIDTH - input.length).join(chalk.dim("."));
  }
  return input;
}

function logPromise(name, promise) {
  process.stdout.write(fitTerminal(name));

  return promise
    .then(result => {
      process.stdout.write(`${OK}\n`);
      return result;
    })
    .catch(err => {
      process.stdout.write(`${FAIL}\n`);
      throw err;
    });
}

function runYarn(script) {
  return execa("yarn", ["--silent", script]).catch(error => {
    throw Error(`\`yarn ${script}\` failed\n${error.stdout}`);
  });
}

function waitForEnter() {
  process.stdin.setRawMode(true);

  return new Promise((resolve, reject) => {
    process.stdin.on("keypress", listener);
    process.stdin.resume();

    function listener(ch, key) {
      if (key.name === "return") {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", listener);
        process.stdin.pause();
        resolve();
      } else if (key.ctrl && key.name === "c") {
        reject(Error("Process terminated by the user"));
      }
    }
  });
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

function writeJson(filename, content) {
  fs.writeFileSync(filename, JSON.stringify(content, null, 2) + "\n");
}

module.exports = {
  runYarn,
  logPromise,
  readJson,
  writeJson,
  waitForEnter
};
