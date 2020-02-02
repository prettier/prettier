"use strict";

// This module uses `eval("require")` to prevent tools such as Rollup
// from hoisting the requires.

// A babel plugin will look for `eval("require")()` and transform to
// `require()` in the bundle, and rewrite the paths to
// require from the top-level.

// NOTE: separate const and function to do the following:
// * execute the `eval` call just once
// * increase the chance that an easy-to-understand function name
//   shows up in case of a stack trace

const requireModuleAtPath = eval("require");

function requireModule(path) {
  return requireModuleAtPath(path);
}

module.exports = requireModule;
