/**
 * @typedef {import("../document/builders.js").Doc} Doc
 */

import { fill, group, hardline } from "../document/builders.js";
import { cleanDoc, replaceEndOfLine } from "../document/utils.js";
import createGetVisitorKeys from "../utils/create-get-visitor-keys.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import {
  countChars,
  unescapeQuoteEntities,
  getTextValueParts,
} from "./utils/index.js";
import preprocess from "./print-preprocess.js";
import { insertPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";
import embed from "./embed.js";
import {
  printClosingTagSuffix,
  printClosingTagEnd,
  printOpeningTagPrefix,
  printOpeningTagStart,
} from "./print/tag.js";
import { printElement } from "./print/element.js";
import { printChildren } from "./print/children.js";
import visitorKeys from "./visitor-keys.js";

const getVisitorKeys = createGetVisitorKeys(visitorKeys);

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "front-matter":
      return replaceEndOfLine(node.raw);
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
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
        return [replaceEndOfLine(value), hasTrailingNewline ? hardline : ""];
      }

      const printed = cleanDoc([
        printOpeningTagPrefix(node, options),
        ...getTextValueParts(node),
        printClosingTagSuffix(node, options),
      ]);

      if (Array.isArray(printed)) {
        return fill(printed);
      }

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
        replaceEndOfLine(
          options.originalText.slice(locStart(node), locEnd(node))
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
        replaceEndOfLine(
          quote === '"'
            ? value.replace(/"/g, "&quot;")
            : value.replace(/'/g, "&apos;")
        ),
        quote,
      ];
    }
    case "cdata": // Transformed into `text`
    default:
      /* istanbul ignore next */
      throw new UnexpectedNodeError(node, "HTML");
  }
}

const printer = {
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode: clean,
  embed,
  getVisitorKeys,
};

export default printer;
