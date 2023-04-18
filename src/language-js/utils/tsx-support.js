function supportsTsx(options) {
  if (!options?.filepath) {
    return;
  }

  if (/\.[jt]sx$/i.test(options.filepath)) {
    return true;
  }

  if (/\.ts$/i.test(options.filepath)) {
    return false;
  }
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

export const getJsxParseOptionCombinations = (text, options) => {
  const shouldEnableJsx = supportsTsx(options);
  if (typeof shouldEnableJsx === "boolean") {
    return [shouldEnableJsx];
  }
  return isProbablyJsx(text) ? [true, false] : [false, true];
};

export const shouldForceTrailingCommaInTypeParameters = (options) =>
  supportsTsx(options) ?? true;
