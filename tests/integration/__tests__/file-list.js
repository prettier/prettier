"use strict";

const path = require("path");
const runPrettier = require("../runPrettier.js");

const lsCommand = `node ${path.join(__dirname, "../cli/file-list/ls.js")}`;
const otherLsCommand = `node ${path.join(__dirname, "../cli/file-list/other-ls.js")}`;

describe("file list", () => {
  runPrettier("cli/file-list", ["**/*.js", "--file-list", lsCommand, "-l"]).test({
    status: 1,
  });
});

describe("multiple file lists", () => {
  runPrettier("cli/file-list", ["**/*.js", "--file-list", lsCommand, "--file-list", otherLsCommand, "-l"]).test({
    status: 1,
  });
});
