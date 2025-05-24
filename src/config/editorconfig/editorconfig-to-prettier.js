const isDefined = (value) => value !== undefined && value !== "unset";

function editorConfigToPrettier(editorConfig) {
  if (!editorConfig) {
    return;
  }

  const result = {};

  const {
    indent_style,
    indent_size,
    tab_width,
    max_line_length,
    quote_type,
    end_of_line,
  } = editorConfig;

  if (isDefined(indent_style)) {
    result.useTabs = indent_style === "tab";
  }

  if (indent_size === "tab") {
    result.useTabs = true;
  }

  if (result.useTabs && isDefined(tab_width)) {
    result.tabWidth = tab_width;
  } else if (
    indent_style === "space" &&
    isDefined(indent_size) &&
    indent_size !== "tab"
  ) {
    result.tabWidth = indent_size;
  } else if (isDefined(tab_width)) {
    result.tabWidth = tab_width;
  }

  if (isDefined(max_line_length)) {
    result.printWidth =
      max_line_length === "off" ? Number.POSITIVE_INFINITY : max_line_length;
  }

  // Undocumented feature, https://github.com/prettier/prettier/pull/12780
  if (quote_type === "single") {
    result.singleQuote = true;
  } else if (quote_type === "double") {
    result.singleQuote = false;
  }

  if (end_of_line === "lf" || end_of_line === "crlf" || end_of_line === "cr") {
    result.endOfLine = end_of_line;
  }

  if (Object.keys(result).length === 0) {
    return;
  }

  return result;
}

export default editorConfigToPrettier;
