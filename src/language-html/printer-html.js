/**
 * @typedef {import("../document/builders.js").Doc} Doc
 */

import { fill, group, hardline } from "../document/builders.js";
import { cleanDoc, replaceEndOfLine } from "../document/utils.js";
import getPreferredQuote from "../utils/get-preferred-quote.js";
import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { insertPragma } from "./pragma.js";
import {
  printAngularControlFlowBlock,
  printAngularControlFlowBlockParameters,
} from "./print/angular-control-flow-block.js";
import {
  printAngularIcuCase,
  printAngularIcuExpression,
} from "./print/angular-icu-expression.js";
import { printChildren } from "./print/children.js";
import { printElement } from "./print/element.js";
import {
  printClosingTagEnd,
  printClosingTagSuffix,
  printOpeningTagPrefix,
  printOpeningTagStart,
} from "./print/tag.js";
import preprocess from "./print-preprocess.js";
import { getTextValueParts, unescapeQuoteEntities } from "./utils/index.js";

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "front-matter":
      return replaceEndOfLine(node.raw);
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
      return [group(printChildren(path, options, print)), hardline];
    case "element":
    case "ieConditionalComment":
      return printElement(path, options, print);

    case "angularControlFlowBlock":
      return printAngularControlFlowBlock(path, options, print);
    case "angularControlFlowBlockParameters":
      return printAngularControlFlowBlockParameters(path, options, print);
    case "angularControlFlowBlockParameter":
      return htmlWhitespaceUtils.trim(node.expression);

    case "angularIcuExpression":
      return printAngularIcuExpression(path, options, print);
    case "angularIcuCase":
      return printAngularIcuCase(path, options, print);

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
      // CDATA should not be formatted
      if (
        node.value.startsWith("<![CDATA") &&
        node.value.endsWith("]>") &&
        options.parser === "angular"
      ) {
        return node.value;
      }
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
          node.value.replace(/^html\b/i, "html").replaceAll(/\s+/g, " "),
        ]),
        printClosingTagEnd(node, options),
      ];
    case "comment":
      return [
        printOpeningTagPrefix(node, options),
        replaceEndOfLine(
          options.originalText.slice(locStart(node), locEnd(node)),
        ),
        printClosingTagSuffix(node, options),
      ];

    case "attribute": {
      if (node.value === null) {
        return node.rawName;
      }
      const value = unescapeQuoteEntities(node.value);
      const quote = getPreferredQuote(value, '"');
      return [
        node.rawName,
        "=",
        quote,
        replaceEndOfLine(
          quote === '"'
            ? value.replaceAll('"', "&quot;")
            : value.replaceAll("'", "&apos;"),
        ),
        quote,
      ];
    }
    case "cdata": // Transformed into `text`
    default:
      /* c8 ignore next */
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
