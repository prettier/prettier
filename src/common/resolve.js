"use strict";

let { resolve } = require;

// In the VS Code and Atom extensions `require` is overridden and `require.resolve` doesn't support the 2nd argument.
if (resolve.length === 1 || process.env.PRETTIER_FALLBACK_RESOLVE) {
  // @ts-ignore
  resolve = (id, options) => {
    let basedir;
    if (options && options.paths && options.paths.length === 1) {
      basedir = options.paths[0];
    }

    return require("resolve").sync(id, { basedir });
  };
}

module.exports = resolve;
