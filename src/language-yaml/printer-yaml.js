/** @typedef {import("../document/builders.js").Doc} Doc */

import {
  breakParent,
  fill,
  group,
  hardline,
  join,
  line,
  lineSuffix,
} from "../document/builders.js";
import { replaceEndOfLine } from "../document/utils.js";
import isPreviousLineEmpty from "../utils/is-previous-line-empty.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locStart } from "./loc.js";
import { insertPragma, isPragma } from "./pragma.js";
import printBlock from "./print/block.js";
import {
  printFlowMapping,
  printFlowSequence,
} from "./print/flow-mapping-sequence.js";
import printMappingItem from "./print/mapping-item.js";
import {
  alignWithSpaces,
  printNextEmptyLine,
  shouldPrintEndComments,
} from "./print/misc.js";
import preprocess from "./print-preprocess.js";
import {
  getFlowScalarLineContents,
  getLastDescendantNode,
  hasEndComments,
  hasLeadingComments,
  hasMiddleComments,
  hasPrettierIgnore,
  hasTrailingComment,
  isInlineNode,
  isLastDescendantNode,
  isNode,
} from "./utils.js";

function genericPrint(path, options, print) {
  const { node } = path;

  /** @type {Doc[]} */
  const parts = [];

  if (node.type !== "mappingValue" && hasLeadingComments(node)) {
    parts.push([join(hardline, path.map(print, "leadingComments")), hardline]);
  }

  const { tag, anchor } = node;
  if (tag) {
    parts.push(print("tag"));
  }
  if (tag && anchor) {
    parts.push(" ");
  }
  if (anchor) {
    parts.push(print("anchor"));
  }

  /** @type {Doc} */
  let nextEmptyLine = "";

  if (
    isNode(node, [
      "mapping",
      "sequence",
      "comment",
      "directive",
      "mappingItem",
      "sequenceItem",
    ]) &&
    !isLastDescendantNode(path)
  ) {
    nextEmptyLine = printNextEmptyLine(path, options.originalText);
  }

  if (tag || anchor) {
    if (isNode(node, ["sequence", "mapping"]) && !hasMiddleComments(node)) {
      parts.push(hardline);
    } else {
      parts.push(" ");
    }
  }

  if (hasMiddleComments(node)) {
    parts.push([
      node.middleComments.length === 1 ? "" : hardline,
      join(hardline, path.map(print, "middleComments")),
      hardline,
    ]);
  }

  if (hasPrettierIgnore(path)) {
    parts.push(
      replaceEndOfLine(
        options.originalText
          .slice(node.position.start.offset, node.position.end.offset)
          .trimEnd(),
      ),
    );
  } else {
    parts.push(group(printNode(path, options, print)));
  }

  if (hasTrailingComment(node) && !isNode(node, ["document", "documentHead"])) {
    parts.push(
      lineSuffix([
        node.type === "mappingValue" && !node.content ? "" : " ",
        path.parent.type === "mappingKey" &&
        path.getParentNode(2).type === "mapping" &&
        isInlineNode(node)
          ? ""
          : breakParent,
        print("trailingComment"),
      ]),
    );
  }

  if (shouldPrintEndComments(node)) {
    parts.push(
      alignWithSpaces(node.type === "sequenceItem" ? 2 : 0, [
        hardline,
        join(
          hardline,
          path.map(
            ({ node }) => [
              isPreviousLineEmpty(options.originalText, locStart(node))
                ? hardline
                : "",
              print(),
            ],
            "endComments",
          ),
        ),
      ]),
    );
  }
  parts.push(nextEmptyLine);
  return parts;
}

function printNode(path, options, print) {
  const { node } = path;
  switch (node.type) {
    case "root": {
      const parts = [];
      path.each(({ node: document, next: nextDocument, isFirst }) => {
        if (!isFirst) {
          parts.push(hardline);
        }
        parts.push(print());
        if (shouldPrintDocumentEndMarker(document, nextDocument)) {
          parts.push(hardline, "...");
          if (hasTrailingComment(document)) {
            parts.push(" ", print("trailingComment"));
          }
        } else if (nextDocument && !hasTrailingComment(nextDocument.head)) {
          parts.push(hardline, "---");
        }
      }, "children");

      const lastDescendantNode = getLastDescendantNode(node);
      if (
        !isNode(lastDescendantNode, ["blockLiteral", "blockFolded"]) ||
        lastDescendantNode.chomping !== "keep"
      ) {
        parts.push(hardline);
      }
      return parts;
    }
    case "document": {
      const parts = [];
      if (shouldPrintDocumentHeadEndMarker(path, options) === "head") {
        if (node.head.children.length > 0 || node.head.endComments.length > 0) {
          parts.push(print("head"));
        }

        if (hasTrailingComment(node.head)) {
          parts.push(["---", " ", print(["head", "trailingComment"])]);
        } else {
          parts.push("---");
        }
      }

      if (shouldPrintDocumentBody(node)) {
        parts.push(print("body"));
      }

      return join(hardline, parts);
    }
    case "documentHead":
      return join(hardline, [
        ...path.map(print, "children"),
        ...path.map(print, "endComments"),
      ]);
    case "documentBody": {
      const { children, endComments } = node;
      /** @type {Doc} */
      let separator = "";
      if (children.length > 0 && endComments.length > 0) {
        const lastDescendantNode = getLastDescendantNode(node);
        // there's already a newline printed at the end of blockValue (chomping=keep, lastDescendant=true)
        if (isNode(lastDescendantNode, ["blockFolded", "blockLiteral"])) {
          // an extra newline for better readability
          if (lastDescendantNode.chomping !== "keep") {
            separator = [hardline, hardline];
          }
        } else {
          separator = hardline;
        }
      }

      return [
        join(hardline, path.map(print, "children")),
        separator,
        join(hardline, path.map(print, "endComments")),
      ];
    }
    case "directive":
      return ["%", join(" ", [node.name, ...node.parameters])];
    case "comment":
      return ["#", node.value];
    case "alias":
      return ["*", node.value];
    case "tag":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      );
    case "anchor":
      return ["&", node.value];
    case "plain":
      return printFlowScalarContent(
        node.type,
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset,
        ),
        options,
      );
    case "quoteDouble":
    case "quoteSingle": {
      const singleQuote = "'";
      const doubleQuote = '"';

      const raw = options.originalText.slice(
        node.position.start.offset + 1,
        node.position.end.offset - 1,
      );

      if (
        (node.type === "quoteSingle" && raw.includes("\\")) ||
        (node.type === "quoteDouble" && /\\[^"]/.test(raw))
      ) {
        // only quoteDouble can use escape chars
        // and quoteSingle do not need to escape backslashes
        const originalQuote =
          node.type === "quoteDouble" ? doubleQuote : singleQuote;
        return [
          originalQuote,
          printFlowScalarContent(node.type, raw, options),
          originalQuote,
        ];
      }

      if (raw.includes(doubleQuote)) {
        return [
          singleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteDouble"
              ? raw
                  // double quote needs to be escaped by backslash in quoteDouble
                  .replaceAll(String.raw`\"`, doubleQuote)
                  .replaceAll("'", singleQuote.repeat(2))
              : raw,
            options,
          ),
          singleQuote,
        ];
      }

      if (raw.includes(singleQuote)) {
        return [
          doubleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteSingle"
              ? // single quote needs to be escaped by 2 single quotes in quoteSingle
                raw.replaceAll("''", singleQuote)
              : raw,
            options,
          ),
          doubleQuote,
        ];
      }

      const quote = options.singleQuote ? singleQuote : doubleQuote;
      return [quote, printFlowScalarContent(node.type, raw, options), quote];
    }
    case "blockFolded":
    case "blockLiteral":
      return printBlock(path, print, options);

    case "mapping":
    case "sequence":
      return join(hardline, path.map(print, "children"));
    case "sequenceItem":
      return ["- ", alignWithSpaces(2, node.content ? print("content") : "")];
    case "mappingKey":
    case "mappingValue":
      return !node.content ? "" : print("content");
    case "mappingItem":
    case "flowMappingItem":
      return printMappingItem(path, print, options);

    case "flowMapping":
      return printFlowMapping(path, print, options);
    case "flowSequence":
      return printFlowSequence(path, print, options);
    case "flowSequenceItem":
      return print("content");
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "YAML");
  }
}

function shouldPrintDocumentBody(document) {
  return document.body.children.length > 0 || hasEndComments(document.body);
}

function shouldPrintDocumentEndMarker(document, nextDocument) {
  return (
    /**
     *... # trailingComment
     */
    hasTrailingComment(document) ||
    (nextDocument &&
      /**
       * ...
       * %DIRECTIVE
       * ---
       */
      (nextDocument.head.children.length > 0 ||
        /**
         * ...
         * # endComment
         * ---
         */
        hasEndComments(nextDocument.head)))
  );
}

function shouldPrintDocumentHeadEndMarker(path, options) {
  const document = path.node;
  if (
    /**
     * ---
     * preserve the first document head end marker
     */
    (path.isFirst &&
      /---(?:\s|$)/.test(
        options.originalText.slice(locStart(document), locStart(document) + 4),
      )) ||
    /**
     * %DIRECTIVE
     * ---
     */
    document.head.children.length > 0 ||
    /**
     * # end comment
     * ---
     */
    hasEndComments(document.head) ||
    /**
     * --- # trailing comment
     */
    hasTrailingComment(document.head)
  ) {
    return "head";
  }

  const nextDocument = path.next;
  if (shouldPrintDocumentEndMarker(document, nextDocument)) {
    return false;
  }

  return nextDocument ? "root" : false;
}

function printFlowScalarContent(nodeType, content, options) {
  const lineContents = getFlowScalarLineContents(nodeType, content, options);
  return join(
    hardline,
    lineContents.map((lineContentWords) => fill(join(line, lineContentWords))),
  );
}

function clean(original, cloned /*, parent */) {
  if (isNode(original)) {
    switch (original.type) {
      case "comment":
        // insert pragma
        if (isPragma(original.value)) {
          return null;
        }
        break;
      case "quoteDouble":
      case "quoteSingle":
        cloned.type = "quote";
        break;
    }
  }
}
clean.ignoredProperties = new Set(["position"]);

const printer = {
  preprocess,
  embed,
  print: genericPrint,
  massageAstNode: clean,
  insertPragma,
  getVisitorKeys,
};

export default printer;
