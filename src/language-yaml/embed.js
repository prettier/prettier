"use strict";

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  // Try to format `.prettierrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.prettierrc$/.test(options.filepath)
  ) {
    return textToDoc(options.originalText, { ...options, parser: "json" });
  }
}

module.exports = embed;
