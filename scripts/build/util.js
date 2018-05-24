"use strict";

const fs = require("fs");
const rimraf = require("rimraf");
const promisify = require("util").promisify;

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function readJson(file) {
  const data = await readFile(file);
  return JSON.parse(data);
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return writeFile(file, content);
}

module.exports = {
  asyncRimRaf: promisify(rimraf),
  readJson,
  writeJson
};
