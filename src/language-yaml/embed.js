"use strict";

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  // Try to format `.prettierrc`, `.stylelintrc`, and `.lintstagedrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(options.filepath)
  ) {
    return textToDoc(options.originalText, { ...options, parser: "json" });
  }
}

module.exports = embed;
