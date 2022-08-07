export const nonTraversableKeysForClean = new Set([
  "sourceSpan",
  "startSourceSpan",
  "endSourceSpan",
  "nameSpan",
  "valueSpan",
]);

export const nonTraversableKeys = new Set([
  ...nonTraversableKeysForClean,
  "tagDefinition",
]);
