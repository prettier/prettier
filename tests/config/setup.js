"use strict";

Object.defineProperty(global, "run_spec", {
  get() {
    return require("./format-test");
  },
});
