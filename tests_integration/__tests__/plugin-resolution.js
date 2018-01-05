"use strict";

const runPrettier = require("../runPrettier");

describe("automatically loads 'prettier-plugin-*' from package.json devDependencies", () => {
  runPrettier("plugins/automatic", ["file.txt", "--parser=foo"]).test({
    stdout: "foo+contents\n",
    stderr: "",
    status: 0,
    write: []
  });
});

describe("automatically loads '@prettier/plugin-*' from package.json dependencies", () => {
  runPrettier("plugins/automatic", ["file.txt", "--parser=bar"]).test({
    stdout: "bar+contents\n",
    stderr: "",
    status: 0,
    write: []
  });
});
