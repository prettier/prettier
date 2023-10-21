// Matches numbers with digits before or after the decimal point (or both) and
// numbers without a decimal point. A leading sign is recognized, as are leading
// and trailing zeroes.
const NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

const PREFIX = "prettier/";

function removeUnset(editorConfig) {
  const result = {};
  const keys = Object.keys(editorConfig);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (editorConfig[key] === "unset") {
      continue;
    }
    result[key] = editorConfig[key];
  }
  return result;
}

function editorConfigToPrettier(editorConfig) {
  if (!editorConfig) {
    return null;
  }

  editorConfig = removeUnset(editorConfig);

  if (Object.keys(editorConfig).length === 0) {
    return null;
  }

  const result = {};

  if (editorConfig.indent_style) {
    result.useTabs = editorConfig.indent_style === "tab";
  }

  if (editorConfig.indent_size === "tab") {
    result.useTabs = true;
  }

  if (result.useTabs && editorConfig.tab_width) {
    result.tabWidth = editorConfig.tab_width;
  } else if (
    editorConfig.indent_style === "space" &&
    editorConfig.indent_size &&
    editorConfig.indent_size !== "tab"
  ) {
    result.tabWidth = editorConfig.indent_size;
  } else if (editorConfig.tab_width !== undefined) {
    result.tabWidth = editorConfig.tab_width;
  }

  if (editorConfig.max_line_length) {
    if (editorConfig.max_line_length === "off") {
      result.printWidth = Number.POSITIVE_INFINITY;
    } else {
      result.printWidth = editorConfig.max_line_length;
    }
  }

  if (editorConfig.quote_type === "single") {
    result.singleQuote = true;
  } else if (editorConfig.quote_type === "double") {
    result.singleQuote = false;
  }

  if (["cr", "crlf", "lf"].includes(editorConfig.end_of_line)) {
    result.endOfLine = editorConfig.end_of_line;
  }

  const prefixed = Object.entries(editorConfig).filter(([key]) =>
    key.startsWith(PREFIX),
  );

  for (const [rawKey, rawValue] of prefixed) {
    const key = rawKey
      .slice(PREFIX.length)
      .replace(/_([a-z])/, (match) => match[1].toUpperCase());

    const value =
      rawValue === "true"
        ? true
        : rawValue === "false"
        ? false
        : NUMBER_PATTERN.test(rawValue)
        ? Number.parseInt(rawValue, 10)
        : rawValue;

    result[key] = value;
  }

  return result;
}

export default editorConfigToPrettier;
