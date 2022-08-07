export const ignoredPropertiesForClean = new Set([
  "sourceSpan",
  "startSourceSpan",
  "endSourceSpan",
  "nameSpan",
  "valueSpan",
]);

export const ignoredProperties = new Set([
  ...ignoredPropertiesForClean,
  "tagDefinition",
]);
