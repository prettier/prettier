const stringReplaceAll = (isOptionalObject, original, pattern, replacement) => {
  if (isOptionalObject && (original === undefined || original === null)) {
    return;
  }

  if (original.replaceAll) {
    return original.replaceAll(pattern, replacement);
  }

  // Simple detection to check if pattern is a `RegExp`
  if (pattern.global) {
    return original.replace(pattern, replacement);
  }

  // Doesn't work for substitutes, eg `.replaceAll("*", "\\$&")`
  return original.split(pattern).join(replacement);
};

export default stringReplaceAll;
