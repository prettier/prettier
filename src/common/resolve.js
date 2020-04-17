"use strict";

let { resolve } = eval("require");

// In the VS Code extension `require` is overridden and `require.resolve` doesn't support the 2nd argument.
if (resolve.length === 1) {
  resolve = (id, options) => {
    let baseDir;
    if (options && options.paths && options.paths.length === 1) {
      baseDir = options.paths[0];
    }

    return require("resolve").sync(id, { baseDir });
  };
}

module.exports = resolve;
