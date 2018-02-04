"use strict";

const runPrettier = require("../runPrettier");
const EOL = require("os").EOL;

describe("automatically loads 'prettier-plugin-*' from package.json devDependencies", () => {
  runPrettier("plugins/automatic", ["file.txt", "--parser=foo"]).test({
    stdout: "foo+contents" + EOL,
    stderr: "",
    status: 0,
    write: []
  });
});

describe("automatically loads '@prettier/plugin-*' from package.json dependencies", () => {
  runPrettier("plugins/automatic", ["file.txt", "--parser=bar"]).test({
    stdout: "bar+contents" + EOL,
    stderr: "",
    status: 0,
    write: []
  });
});
