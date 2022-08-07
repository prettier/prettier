export const ignoredPropertiesForClean = new Set([
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

export const ignoredProperties = new Set([
  ...ignoredPropertiesForClean,
  "type",
]);
