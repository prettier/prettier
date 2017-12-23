"use strict";

const util = require("../common/util");
const doc = require("../doc");
const docBuilders = doc.builders;
const hardline = docBuilders.hardline;
const concat = docBuilders.concat;

function embed(path, print, format, options) {
  const node = path.getValue();

  if (node.type === "code") {
    const parser = getParserName(node.lang);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      const doc = format(node.value, { parser }, options);
      return concat([style, node.lang, hardline, doc, style]);
    }
  }

  return null;

  function getParserName(lang) {
    switch (lang) {
      case "js":
      case "jsx":
      case "javascript":
        return "babylon";
      case "ts":
      case "tsx":
      case "typescript":
        return "typescript";
      case "gql":
      case "graphql":
        return "graphql";
      case "css":
        return "css";
      case "less":
        return "less";
      case "scss":
        return "scss";
      case "json":
      case "json5":
        return "json";
      case "md":
      case "markdown":
        return "markdown";
      default:
        return null;
    }
  }
}

module.exports = embed;
