import assert from "node:assert";

export const FORMAT_PRAGMAS = ["format", "prettier"];
export const FORMAT_IGNORE_PRAGMAS = FORMAT_PRAGMAS.map(
  (pragma) => `no${pragma}`,
);
export const FORMAT_PRAGMA_TO_INSERT = FORMAT_PRAGMAS[0];

// Regular expressions put in this file so they can be evaluate

// This exists because the regexp was rewrite from existing, feel free to remove when updating them
const assertRegexpEqual = (regexpA, regexpB) => {
  assert.equal(regexpA.source, regexpB.source);
};

export const YAML_IS_PRAGMA_REGEXP = new RegExp(
  String.raw`^\s*@(?:${FORMAT_PRAGMAS.join("|")})\s*$`,
  "u",
);
assertRegexpEqual(YAML_IS_PRAGMA_REGEXP, /^\s*@(?:format|prettier)\s*$/u);

export const [YAML_HAS_PRAGMA_REGEXP, YAML_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(
      String.raw`^\s*#[^\S\n]*@(?:${pragmas.join("|")})\s*?(?:\n|$)`,
      "u",
    ),
);
assertRegexpEqual(
  YAML_HAS_PRAGMA_REGEXP,
  /^\s*#[^\S\n]*@(?:format|prettier)\s*?(?:\n|$)/u,
);
assertRegexpEqual(
  YAML_HAS_IGNORE_PRAGMA_REGEXP,
  /^\s*#[^\S\n]*@(?:noformat|noprettier)\s*?(?:\n|$)/u,
);

export const [GRAPHQL_HAS_PRAGMA_REGEXP, GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(
      String.raw`^\s*#[^\S\n]*@(?:${pragmas.join("|")})\s*(?:\n|$)`,
      "u",
    ),
);
assertRegexpEqual(
  GRAPHQL_HAS_PRAGMA_REGEXP,
  /^\s*#[^\S\n]*@(?:format|prettier)\s*(?:\n|$)/u,
);
assertRegexpEqual(
  GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP,
  /^\s*#[^\S\n]*@(?:noformat|noprettier)\s*(?:\n|$)/u,
);

export const [HTML_HAS_PRAGMA_REGEXP, HTML_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(String.raw`^\s*<!--\s*@(?:${pragmas.join("|")})\s*-->`, "u"),
);
assertRegexpEqual(
  HTML_HAS_PRAGMA_REGEXP,
  /^\s*<!--\s*@(?:format|prettier)\s*-->/u,
);
assertRegexpEqual(
  HTML_HAS_IGNORE_PRAGMA_REGEXP,
  /^\s*<!--\s*@(?:noformat|noprettier)\s*-->/u,
);
