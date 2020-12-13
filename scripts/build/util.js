"use strict";

const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const readJson = async (file) => {
  const data = await readFile(file);
  return JSON.parse(data);
};

const writeJson = (file, content) => {
  content = JSON.stringify(content, null, 2);
  return writeFile(file, content);
};

const copyFile = async (from, to) => {
  const data = await readFile(from);
  return writeFile(to, data);
};

module.exports = {
  readJson,
  writeJson,
  copyFile,
  readFile,
  writeFile,
};
