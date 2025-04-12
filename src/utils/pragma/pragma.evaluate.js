import assert from "node:assert";

export const FORMAT_PRAGMAS = ["format", "prettier"];
export const FORMAT_PRAGMA_TO_INSERT = FORMAT_PRAGMAS[0];

// Regular expressions put in this file so they can be evaluate

// This exists because the regexp was rewrite from existing, feel free to remove when updating them
const assertRegexpEqual = (regexpA, regexpB) => {
  assert.ok(regexpA.source, regexpB.source);
};

export const YAML_IS_PRAGMA_REGEXP = new RegExp(
  String.raw`^\s*@(?:${FORMAT_PRAGMAS.join("|")})\s*$`,
  "u",
);
assertRegexpEqual(YAML_IS_PRAGMA_REGEXP, /^\s*@(?:prettier|format)\s*$/u);

export const YAML_HAS_PRAGMA_REGEXP = new RegExp(
  String.raw`^\s*#[^\S\n]*@(?:${FORMAT_PRAGMAS.join("|")})\s*?(?:\n|$)`,
  "u",
);
assertRegexpEqual(
  YAML_HAS_PRAGMA_REGEXP,
  /^\s*#[^\S\n]*@(?:prettier|format)\s*?(?:\n|$)/u,
);

export const GRAPHQL_HAS_PRAGMA_REGEXP = new RegExp(
  String.raw`^\s*#[^\S\n]*@(?:${FORMAT_PRAGMAS.join("|")})\s*(?:\n|$)`,
  "u",
);
assertRegexpEqual(
  GRAPHQL_HAS_PRAGMA_REGEXP,
  /^\s*#[^\S\n]*@(?:format|prettier)\s*(?:\n|$)/u,
);

export const HTML_HAS_PRAGMA_REGEXP = new RegExp(
  String.raw`^\s*<!--\s*@(?:${FORMAT_PRAGMAS.join("|")})\s*-->`,
  "u",
);
assertRegexpEqual(
  HTML_HAS_PRAGMA_REGEXP,
  /^\s*<!--\s*@(?:format|prettier)\s*-->/u,
);
