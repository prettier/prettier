/**
 * @import {Doc} from "../document/index.js"
 */

import {
  group,
  hardline,
  indent,
  line,
  replaceEndOfLine,
} from "../document/index.js";
import htmlWhitespace from "../utilities/html-whitespace.js";
import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import {
  printAngularControlFlowBlock,
  printAngularControlFlowBlockParameters,
} from "./print/angular-control-flow-block.js";
import {
  printAngularIcuCase,
  printAngularIcuExpression,
} from "./print/angular-icu-expression.js";
import { printAttribute } from "./print/attribute.js";
import { printChildren } from "./print/children.js";
import { printElement } from "./print/element.js";
import { printStartTagComment } from "./print/start-tag-comment.js";
import {
  printClosingTagEnd,
  printClosingTagSuffix,
  printOpeningTagPrefix,
  printOpeningTagStart,
} from "./print/tag.js";
import { printText } from "./print/text.js";
import preprocess from "./print-preprocess.js";

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.kind) {
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
      return htmlWhitespace.trim(node.expression);

    case "angularLetDeclaration":
      // print like "break-after-operator" layout assignment in estree printer
      return group([
        "@let ",
        group([node.id, " =", group(indent([line, print("init")]))]),
        // semicolon is required
        ";",
      ]);
    case "angularLetDeclarationInitializer":
      // basically printed via embedded formatting
      return node.value;

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
    case "text":
      return printText(path, options /* , print*/);
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
    case "cdata":
      return [
        printOpeningTagPrefix(node, options),
        "<![CDATA[",
        replaceEndOfLine(node.value),
        "]]>",
        printClosingTagSuffix(node, options),
      ];

    case "attribute":
      return printAttribute(path, options /* , print */);

    case "startTagComment":
      return printStartTagComment(path);

    case "frontMatter": // Handled in core
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "HTML");
  }
}

const printer = {
  features: {
    experimental_frontMatterSupport: {
      massageAstNode: true,
      embed: true,
      print: true,
    },
  },
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode,
  embed,
  getVisitorKeys,
};

export default printer;
