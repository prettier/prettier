"use strict";

const resolve = require("resolve");

const { resolve: nativeResolve } = eval("require");

// In the VS Code extension `require` is overridden and `require.resolve` doesn't support the 2nd argument.
if (nativeResolve.length === 1) {
  module.exports = (id, options) => {
    let baseDir;
    if (options && options.paths && options.paths.length === 1) {
      baseDir = options.paths[0];
    }

    return resolve.sync(id, { baseDir });
  };
} else {
  module.exports = nativeResolve;
}
