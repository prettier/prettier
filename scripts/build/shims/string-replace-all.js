const replaceAll = ({
  object: original,
  isOptionalObject,
  arguments: [pattern, replacement],
}) => {
  if (isOptionalObject && (original === undefined || original === null)) {
    return;
  }

  if (String.prototype.replaceAll) {
    return original.replaceAll(pattern, replacement);
  }

  // Simple detection to check if pattern is a `RegExp`
  if (pattern.global) {
    return original.replace(pattern, replacement);
  }

  return original.split(pattern).join(replacement);
};

export default replaceAll;
