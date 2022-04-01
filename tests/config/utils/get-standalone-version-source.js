"use strict";

const fs = require("fs");
const fastGlob = require("fast-glob");

function getStandaloneVersionSource(prettierDirectory) {
  const files = fastGlob
    .sync(["standalone.js", "parser-*.js"], {
      cwd: prettierDirectory,
      absolute: true,
    })
    .map((file) => ({
      file,
      get text() {
        return fs.readFileSync(file, "utf8");
      },
    }));

  return {
    files,
    get text() {
      return files.map(({ text }) => text).join(";");
    },
  };
}

module.exports = getStandaloneVersionSource;
