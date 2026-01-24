const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

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

  if (indent_style === "space") {
    result.useTabs = false;
  } else if (indent_style === "tab" || indent_size === "tab") {
    result.useTabs = true;
  }

  // This part not strictly following https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties
  if (result.useTabs === false && isPositiveInteger(indent_size)) {
    result.tabWidth = indent_size;
  } else if (isPositiveInteger(tab_width)) {
    result.tabWidth = tab_width;
  }

  if (max_line_length === "off") {
    result.printWidth = Number.POSITIVE_INFINITY;
  } else if (isPositiveInteger(max_line_length)) {
    result.printWidth = max_line_length;
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
