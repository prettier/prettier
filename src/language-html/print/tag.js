/**
 * @import {Doc} from "../../document/builders.js"
 */

import assert from "node:assert";
import {
  hardline,
  indent,
  join,
  line,
  softline,
} from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import {
  getLastDescendant,
  hasPrettierIgnore,
  isPreLikeNode,
  isTextLikeNode,
  isVueSfcBlock,
  shouldPreserveContent,
} from "../utils/index.js";

function printClosingTag(node, options) {
  return [
    node.isSelfClosing ? "" : printClosingTagStart(node, options),
    printClosingTagEnd(node, options),
  ];
}

function printClosingTagStart(node, options) {
  return node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
    ? ""
    : [
        printClosingTagPrefix(node, options),
        printClosingTagStartMarker(node, options),
      ];
}

function printClosingTagEnd(node, options) {
  return (
    node.next
      ? needsToBorrowPrevClosingTagEndMarker(node.next)
      : needsToBorrowLastChildClosingTagEndMarker(node.parent)
  )
    ? ""
    : [
        printClosingTagEndMarker(node, options),
        printClosingTagSuffix(node, options),
      ];
}

function printClosingTagPrefix(node, options) {
  return needsToBorrowLastChildClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.lastChild, options)
    : "";
}

function printClosingTagSuffix(node, options) {
  return needsToBorrowParentClosingTagStartMarker(node)
    ? printClosingTagStartMarker(node.parent, options)
    : needsToBorrowNextOpeningTagStartMarker(node)
      ? printOpeningTagStartMarker(node.next, options)
      : "";
}

function printClosingTagStartMarker(node, options) {
  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(!node.isSelfClosing);
  }
  /* c8 ignore next 3 */
  if (shouldNotPrintClosingTag(node, options)) {
    return "";
  }
  switch (node.type) {
    case "ieConditionalComment":
      return "<!";
    case "element":
      if (node.hasHtmComponentClosingTag) {
        return "<//";
      }
    // fall through
    default:
      return `</${node.rawName}`;
  }
}

function printClosingTagEndMarker(node, options) {
  if (shouldNotPrintClosingTag(node, options)) {
    return "";
  }
  switch (node.type) {
    case "ieConditionalComment":
    case "ieConditionalEndComment":
      return "[endif]-->";
    case "ieConditionalStartComment":
      return "]><!-->";
    case "interpolation":
      return "}}";
    case "angularIcuExpression":
      return "}";
    case "element":
      if (node.isSelfClosing) {
        return "/>";
      }
    // fall through
    default:
      return ">";
  }
}

function shouldNotPrintClosingTag(node, options) {
  return (
    !node.isSelfClosing &&
    !node.endSourceSpan &&
    (hasPrettierIgnore(node) || shouldPreserveContent(node.parent, options))
  );
}

function needsToBorrowPrevClosingTagEndMarker(node) {
  /**
   *     <p></p
   *     >123
   *     ^
   *
   *     <p></p
   *     ><a
   *     ^
   */
  return (
    node.prev &&
    node.prev.type !== "docType" &&
    node.type !== "angularControlFlowBlock" &&
    !isTextLikeNode(node.prev) &&
    node.isLeadingSpaceSensitive &&
    !node.hasLeadingSpaces
  );
}

function needsToBorrowLastChildClosingTagEndMarker(node) {
  /**
   *     <p
   *       ><a></a
   *       ></p
   *       ^
   *     >
   */
  return (
    node.lastChild?.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces &&
    !isTextLikeNode(getLastDescendant(node.lastChild)) &&
    !isPreLikeNode(node)
  );
}

function needsToBorrowParentClosingTagStartMarker(node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   *
   *         123</b
   *       ></a
   *        ^^^
   *     >
   */
  return (
    !node.next &&
    !node.hasTrailingSpaces &&
    node.isTrailingSpaceSensitive &&
    isTextLikeNode(getLastDescendant(node))
  );
}

function needsToBorrowNextOpeningTagStartMarker(node) {
  /**
   *     123<p
   *        ^^
   *     >
   */
  return (
    node.next &&
    !isTextLikeNode(node.next) &&
    isTextLikeNode(node) &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces
  );
}

function getPrettierIgnoreAttributeCommentData(value) {
  const match = value.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/su);

  if (!match) {
    return false;
  }

  if (!match[1]) {
    return true;
  }

  return match[1].split(/\s+/u);
}

function needsToBorrowParentOpeningTagEndMarker(node) {
  /**
   *     <p
   *       >123
   *       ^
   *
   *     <p
   *       ><a
   *       ^
   */
  return !node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function printAttributes(path, options, print) {
  const { node } = path;

  if (!isNonEmptyArray(node.attrs)) {
    return node.isSelfClosing
      ? /**
         *     <br />
         *        ^
         */
        " "
      : "";
  }

  const ignoreAttributeData =
    node.prev?.type === "comment" &&
    getPrettierIgnoreAttributeCommentData(node.prev.value);

  const hasPrettierIgnoreAttribute =
    typeof ignoreAttributeData === "boolean"
      ? () => ignoreAttributeData
      : Array.isArray(ignoreAttributeData)
        ? (attribute) => ignoreAttributeData.includes(attribute.rawName)
        : () => false;

  const printedAttributes = path.map(
    ({ node: attribute }) =>
      hasPrettierIgnoreAttribute(attribute)
        ? replaceEndOfLine(
            options.originalText.slice(locStart(attribute), locEnd(attribute)),
          )
        : print(),
    "attrs",
  );

  const forceNotToBreakAttrContent =
    node.type === "element" &&
    node.fullName === "script" &&
    node.attrs.length === 1 &&
    node.attrs[0].fullName === "src" &&
    node.children.length === 0;

  const shouldPrintAttributePerLine =
    options.singleAttributePerLine &&
    node.attrs.length > 1 &&
    !isVueSfcBlock(node, options);
  const attributeLine = shouldPrintAttributePerLine ? hardline : line;

  /** @type {Doc[]} */
  const parts = [
    indent([
      forceNotToBreakAttrContent ? " " : line,
      join(attributeLine, printedAttributes),
    ]),
  ];

  if (
    /**
     *     123<a
     *       attr
     *           ~
     *       >456
     */
    (node.firstChild &&
      needsToBorrowParentOpeningTagEndMarker(node.firstChild)) ||
    /**
     *     <span
     *       >123<meta
     *                ~
     *     /></span>
     */
    (node.isSelfClosing &&
      needsToBorrowLastChildClosingTagEndMarker(node.parent)) ||
    forceNotToBreakAttrContent
  ) {
    parts.push(node.isSelfClosing ? " " : "");
  } else {
    parts.push(
      options.bracketSameLine
        ? node.isSelfClosing
          ? " "
          : ""
        : node.isSelfClosing
          ? line
          : softline,
    );
  }

  return parts;
}

function printOpeningTagEnd(node) {
  return node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
    ? ""
    : printOpeningTagEndMarker(node);
}

function printOpeningTag(path, options, print) {
  const { node } = path;

  return [
    printOpeningTagStart(node, options),
    printAttributes(path, options, print),
    node.isSelfClosing ? "" : printOpeningTagEnd(node),
  ];
}

function printOpeningTagStart(node, options) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : [
        printOpeningTagPrefix(node, options),
        printOpeningTagStartMarker(node, options),
      ];
}

function printOpeningTagPrefix(node, options) {
  return needsToBorrowParentOpeningTagEndMarker(node)
    ? printOpeningTagEndMarker(node.parent)
    : needsToBorrowPrevClosingTagEndMarker(node)
      ? printClosingTagEndMarker(node.prev, options)
      : "";
}

const HTML5_DOCTYPE_START_MARKER = "<!doctype";
function printOpeningTagStartMarker(node, options) {
  switch (node.type) {
    case "ieConditionalComment":
    case "ieConditionalStartComment":
      return `<!--[if ${node.condition}`;
    case "ieConditionalEndComment":
      return "<!--<!";
    case "interpolation":
      return "{{";
    case "docType": {
      // Only lowercase HTML5 doctype in `.html` and `.htm` files
      if (node.value === "html") {
        const filepath = options.filepath ?? "";
        if (/\.html?$/u.test(filepath)) {
          return HTML5_DOCTYPE_START_MARKER;
        }
      }

      const original = options.originalText.slice(locStart(node), locEnd(node));

      return original.slice(0, HTML5_DOCTYPE_START_MARKER.length);
    }

    case "angularIcuExpression":
      return "{";
    case "element":
      if (node.condition) {
        return `<!--[if ${node.condition}]><!--><${node.rawName}`;
      }
    // fall through
    default:
      return `<${node.rawName}`;
  }
}

function printOpeningTagEndMarker(node) {
  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(!node.isSelfClosing);
  }
  switch (node.type) {
    case "ieConditionalComment":
      return "]>";
    case "element":
      if (node.condition) {
        return "><!--<![endif]-->";
      }
    // fall through
    default:
      return ">";
  }
}

export {
  needsToBorrowLastChildClosingTagEndMarker,
  needsToBorrowNextOpeningTagStartMarker,
  needsToBorrowParentClosingTagStartMarker,
  needsToBorrowParentOpeningTagEndMarker,
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTag,
  printClosingTagEnd,
  printClosingTagEndMarker,
  printClosingTagStartMarker,
  printClosingTagSuffix,
  printOpeningTag,
  printOpeningTagEndMarker,
  printOpeningTagPrefix,
  printOpeningTagStart,
  printOpeningTagStartMarker,
};
