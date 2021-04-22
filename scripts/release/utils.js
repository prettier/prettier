"use strict";

require("readline").emitKeypressEvents(process.stdin);

const fs = require("fs");
const chalk = require("chalk");
const execa = require("execa");
const stringWidth = require("string-width");
const fetch = require("node-fetch");

const OK = chalk.bgGreen.black(" DONE ");
const FAIL = chalk.bgRed.black(" FAIL ");

function fitTerminal(input) {
  const columns = Math.min(process.stdout.columns, 80);
  const WIDTH = columns - stringWidth(OK) + 1;
  if (input.length < WIDTH) {
    input += chalk.dim(".").repeat(WIDTH - input.length - 1);
  }
  return input;
}

async function logPromise(name, promiseOrAsyncFunction) {
  const promise =
    typeof promiseOrAsyncFunction === "function"
      ? promiseOrAsyncFunction()
      : promiseOrAsyncFunction;

  process.stdout.write(fitTerminal(name));

  try {
    const result = await promise;
    process.stdout.write(`${OK}\n`);
    return result;
  } catch (error) {
    process.stdout.write(`${FAIL}\n`);
    throw error;
  }
}

async function runYarn(args, options) {
  args = Array.isArray(args) ? args : [args];

  try {
    return await execa("yarn", ["--silent", ...args], options);
  } catch (error) {
    throw new Error(`\`yarn ${args.join(" ")}\` failed\n${error.stdout}`);
  }
}

function runGit(args, options) {
  args = Array.isArray(args) ? args : [args];
  return execa("git", args, options);
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
        reject(new Error("Process terminated by the user"));
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

function processFile(filename, fn) {
  const content = fs.readFileSync(filename, "utf-8");
  fs.writeFileSync(filename, fn(content));
}

async function fetchText(url) {
  const response = await fetch(url);
  return response.text();
}

module.exports = {
  runYarn,
  runGit,
  fetchText,
  logPromise,
  processFile,
  readJson,
  writeJson,
  waitForEnter,
};
