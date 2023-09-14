module.exports = editorConfigToPrettier;

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

  if (["cr", "crlf", "lf"].indexOf(editorConfig.end_of_line) !== -1) {
    result.endOfLine = editorConfig.end_of_line;
  }

  if (
    editorConfig.insert_final_newline === false ||
    editorConfig.insert_final_newline === true
  ) {
    result.insertFinalNewline = editorConfig.insert_final_newline;
  }

  return result;
}
