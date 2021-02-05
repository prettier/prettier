"use strict";

const fs = require("fs").promises;

async function readJson(file) {
  const data = await fs.readFile(file);
  return JSON.parse(data);
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return fs.writeFile(file, content);
}

async function copyFile(from, to) {
  const data = await fs.readFile(from);
  return fs.writeFile(to, data);
}

module.exports = {
  readJson,
  writeJson,
  copyFile,
};
