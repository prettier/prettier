import syntaxImportAssertions from "@babel/plugin-syntax-import-assertions" with {
  BABEL_8_BREAKING: "false",
  USE_ESM: "true", IS_STANDALONE: "false" };

import foo from "foo" with {
  BABEL_8_BREAKING: "false",
  USE_ESM: "true", IS_STANDALONE: "false" };

import foo2 from "foo" with {
  BABEL_8_BREAKING: "false", };

import foo3 from "foo" with { BABEL_8_BREAKING: "false", };
