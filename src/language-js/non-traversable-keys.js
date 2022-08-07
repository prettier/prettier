export const nonTraversableKeysForClean = new Set([
  "range",
  "raw",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "extra",
  "start",
  "end",
  "loc",
  "flags",
  "errors",
  "tokens",
  "parent",
]);

export const nonTraversableKeys = new Set([
  ...nonTraversableKeysForClean,
  "type",
]);
