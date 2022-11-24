"use strict";

/**
 * @typedef {import("../document").Doc} Doc
 */

const {
  builders: { fill, group, hardline, literalline },
  utils: { cleanDoc, getDocParts, isConcat, replaceTextEndOfLine },
} = require("../document/index.js");
const clean = require("./clean.js");
const {
  countChars,
  unescapeQuoteEntities,
  getTextValueParts,
} = require("./utils/index.js");
const preprocess = require("./print-preprocess.js");
const { insertPragma } = require("./pragma.js");
const { locStart, locEnd } = require("./loc.js");
const embed = require("./embed.js");
const {
  printClosingTagSuffix,
  printClosingTagEnd,
  printOpeningTagPrefix,
  printOpeningTagStart,
} = require("./print/tag.js");
const { printElement } = require("./print/element.js");
const { printChildren } = require("./print/children.js");

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "front-matter":
      return replaceTextEndOfLine(node.raw);
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
      // use original concat to not break stripTrailingHardline
      return [group(printChildren(path, options, print)), hardline];
    case "element":
    case "ieConditionalComment": {
      return printElement(path, options, print);
    }
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return [printOpeningTagStart(node), printClosingTagEnd(node)];
    case "interpolation":
      return [
        printOpeningTagStart(node, options),
        ...path.map(print, "children"),
        printClosingTagEnd(node, options),
      ];
    case "text": {
      if (node.parent.type === "interpolation") {
        // replace the trailing literalline with hardline for better readability
        const trailingNewlineRegex = /\n[^\S\n]*$/;
        const hasTrailingNewline = trailingNewlineRegex.test(node.value);
        const value = hasTrailingNewline
          ? node.value.replace(trailingNewlineRegex, "")
          : node.value;
        return [
          ...replaceTextEndOfLine(value),
          hasTrailingNewline ? hardline : "",
        ];
      }

      const printed = cleanDoc([
        printOpeningTagPrefix(node, options),
        ...getTextValueParts(node),
        printClosingTagSuffix(node, options),
      ]);
      if (isConcat(printed) || printed.type === "fill") {
        return fill(getDocParts(printed));
      }
      /* istanbul ignore next */
      return printed;
    }
    case "docType":
      return [
        group([
          printOpeningTagStart(node, options),
          " ",
          node.value.replace(/^html\b/i, "html").replace(/\s+/g, " "),
        ]),
        printClosingTagEnd(node, options),
      ];
    case "comment": {
      return [
        printOpeningTagPrefix(node, options),
        ...replaceTextEndOfLine(
          options.originalText.slice(locStart(node), locEnd(node)),
          literalline
        ),
        printClosingTagSuffix(node, options),
      ];
    }
    case "attribute": {
      if (node.value === null) {
        return node.rawName;
      }
      const value = unescapeQuoteEntities(node.value);
      const singleQuoteCount = countChars(value, "'");
      const doubleQuoteCount = countChars(value, '"');
      const quote = singleQuoteCount < doubleQuoteCount ? "'" : '"';
      return [
        node.rawName,

        "=",
        quote,

        ...replaceTextEndOfLine(
          quote === '"'
            ? value.replace(/"/g, "&quot;")
            : value.replace(/'/g, "&apos;")
        ),
        quote,
      ];
    }
    default:
      /* istanbul ignore next */
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

module.exports = {
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode: clean,
  embed,
};
