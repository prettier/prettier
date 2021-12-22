"use strict";

const runPrettier = require("../runPrettier.js");

describe("help info", () => {
  runPrettier("plugins/options", ["--help", "plugin-search-dir"]).test({
    status: 0,
    write: [],
    stderr: "",
  });
  runPrettier("plugins/options", ["--help", "no-plugin-search-dir"]).test({
    status: 0,
    write: [],
    stderr: "",
  });
});

describe("cli", () => {
  runPrettier("plugins/automatic/", ["--file-info", "file.foo"]).test({
    status: 0,
    write: [],
    stderr: "",
  });
  runPrettier("plugins/automatic/", [
    "--file-info",
    "file.foo",
    "--no-plugin-search-dir",
  ]).test({
    status: 0,
    write: [],
    stderr: "",
  });
});
