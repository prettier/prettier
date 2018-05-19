"use strict";

const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

function asyncRimRaf(path) {
  return new Promise((resolve, reject) => {
    rimraf(path, error => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getRelativePath(filepath) {
  return `./${path.basename(filepath).replace(/\.js$/, "")}`;
}

function readJson(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return new Promise((resolve, reject) => {
    fs.writeFile(file, content, error => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  asyncRimRaf,
  getRelativePath,
  readJson,
  writeJson
};
