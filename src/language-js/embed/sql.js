"use strict";

const {
  builders: { softline, group, indent },
} = require("../../document/index.js");

function format(path, print, textToDoc, options) {
  const node = path.getValue();

  if (
    options.plugins.some(
      (plugin) =>
        typeof plugin !== "string" &&
        plugin.parsers &&
        Object.prototype.hasOwnProperty.call(plugin.parsers, "sql")
    )
  ) {
    const text = node.quasis[0].value.raw.replace(
      /((?:\\\\)*)\\`/g,
      (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
    );

    const doc = textToDoc(text, { parser: "sql" }, options);

    return group(["`", indent([softline, group(doc)]), "`"]);
  }
}

module.exports = format;
