"use strict";
const vm = require("vm");
const fs = require("fs");

function createSandBox({ files }) {
  const source = files.map((file) => fs.readFileSync(file, "utf8")).join(";");
  const sandbox = vm.createContext({
    // https://github.com/nodejs/node/issues/46558
    URL,
  });

  vm.runInContext(source, sandbox);

  return sandbox;
}

module.exports = createSandBox;
