"use strict";

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  // Try to format certain config files as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:commitlintrc|postcssrc|posthtmlrc|prettier|stylelint)rc$/.test(
      options.filepath
    )
  ) {
    return textToDoc(options.originalText, { ...options, parser: "json" });
  }
}

module.exports = embed;
