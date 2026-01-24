export const FORMAT_PRAGMAS = ["format", "prettier"];
export const FORMAT_IGNORE_PRAGMAS = FORMAT_PRAGMAS.map(
  (pragma) => `no${pragma}`,
);
export const FORMAT_PRAGMA_TO_INSERT = FORMAT_PRAGMAS[0];

// Regular expressions are put in this file so they can be evaluated

export const YAML_IS_PRAGMA_REGEXP = new RegExp(
  String.raw`^\s*@(?:${FORMAT_PRAGMAS.join("|")})\s*$`,
);

export const [YAML_HAS_PRAGMA_REGEXP, YAML_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(String.raw`^\s*#[^\S\n]*@(?:${pragmas.join("|")})\s*?(?:\n|$)`),
);

export const [GRAPHQL_HAS_PRAGMA_REGEXP, GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(String.raw`^\s*#[^\S\n]*@(?:${pragmas.join("|")})\s*(?:\n|$)`),
);

export const [HTML_HAS_PRAGMA_REGEXP, HTML_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(String.raw`^\s*<!--\s*@(?:${pragmas.join("|")})\s*-->`),
);

export const [MARKDOWN_HAS_PRAGMA_REGEXP, MARKDOWN_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map((pragmas) => {
  const pragma = `@(?:${pragmas.join("|")})`;
  return new RegExp(
    [
      String.raw`<!--\s*${pragma}\s*-->`,
      String.raw`\{\s*\/\*\s*${pragma}\s*\*\/\s*\}`,
      `<!--.*\r?\n[\\s\\S]*(^|\n)[^\\S\n]*${pragma}[^\\S\n]*($|\n)[\\s\\S]*\n.*-->`,
    ].join("|"),
    "m",
  );
});
