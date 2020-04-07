"use strict";

let { resolve } = eval("require");

// In the VS Code extension `require` is overridden and `require.resolve` doesn't support the 2nd argument.
if (resolve.length === 1) {
  const Module = eval("require")("module");
  const createRequire = Module.createRequire || Module.createRequireFromPath;
  resolve = createRequire(__dirname).resolve;
}

module.exports = resolve;
