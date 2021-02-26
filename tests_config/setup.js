"use strict";

Object.defineProperty(global, "run_spec", {
  get() {
    return require("./run_spec");
  },
});

Object.defineProperty(global, "runAstCompareTest", {
  get() {
    return require("./run-ast-compare-test");
  },
});
