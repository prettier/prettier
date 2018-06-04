"use strict";

const chalk = require("chalk");
const fs = require("fs");
const { exec } = require("child-process-promise");
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

async function execYarn(command) {
  try {
    await exec(`yarn --silent ${command}`);
  } catch (error) {
    throw Error(`\`yarn ${command}\` failed\n${error.stdout}`);
  }
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

function writeJson(filename, content) {
  fs.writeFileSync(filename, JSON.stringify(content, null, 2) + "\n");
}

module.exports = {
  execYarn,
  logPromise,
  readJson,
  writeJson
};
