"use strict";

module.exports = require("ast-types/fork")([
  // This core module of AST types captures ES5 as it is parsed today by
  // git://github.com/ariya/esprima.git#master.
  require("ast-types/def/core"),

  // Feel free to add to or remove from this list of extension modules to
  // configure the precise type hierarchy that you need.
  require("ast-types/def/es6"),
  require("ast-types/def/es7"),
  require("ast-types/def/mozilla"),
  require("ast-types/def/e4x"),
  require("ast-types/def/jsx"),
  require("ast-types/def/flow"),
  require("ast-types/def/esprima"),
  require("ast-types/def/babel"),
  require("ast-types/def/babel6"),
  require("./typescript-ast-nodes.js")
]);
