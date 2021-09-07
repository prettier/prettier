"use strict";

/**
 * @typedef {import("../../document").Doc} Doc
 */

const assert = require("assert");
const { isNonEmptyArray } = require("../../common/util.js");
const { isTextLikeNode } = require("../utils.js");
const {
  builders: { indent, join, softline, line },
  utils: { replaceTextEndOfLine },
} = require("../../document/index.js");
const { locStart, locEnd } = require("../loc.js");
const {
  printClosingTagEndMarker,
  needsToBorrowLastChildClosingTagEndMarker,
  needsToBorrowPrevClosingTagEndMarker,
} = require("./closing-tag.js");

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
  const match = value.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/s);

  if (!match) {
    return false;
  }

  if (!match[1]) {
    return true;
  }

  return match[1].split(/\s+/);
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
  const node = path.getValue();

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
    node.prev &&
    node.prev.type === "comment" &&
    getPrettierIgnoreAttributeCommentData(node.prev.value);

  const hasPrettierIgnoreAttribute =
    typeof ignoreAttributeData === "boolean"
      ? () => ignoreAttributeData
      : Array.isArray(ignoreAttributeData)
      ? (attribute) => ignoreAttributeData.includes(attribute.rawName)
      : () => false;

  const printedAttributes = path.map((attributePath) => {
    const attribute = attributePath.getValue();
    return hasPrettierIgnoreAttribute(attribute)
      ? replaceTextEndOfLine(
          options.originalText.slice(locStart(attribute), locEnd(attribute))
        )
      : print();
  }, "attrs");

  const forceNotToBreakAttrContent =
    node.type === "element" &&
    node.fullName === "script" &&
    node.attrs.length === 1 &&
    node.attrs[0].fullName === "src" &&
    node.children.length === 0;

  /** @type {Doc[]} */
  const parts = [
    indent([
      forceNotToBreakAttrContent ? " " : line,
      join(line, printedAttributes),
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
        : softline
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
  const node = path.getValue();

  return [
    printOpeningTagStart(node, options),
    printAttributes(path, options, print),
    node.isSelfClosing ? "" : printOpeningTagEnd(node),
  ];
}

function printOpeningTagStart(node, options) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : [printOpeningTagPrefix(node, options), printOpeningTagStartMarker(node)];
}

function printOpeningTagPrefix(node, options) {
  return needsToBorrowParentOpeningTagEndMarker(node)
    ? printOpeningTagEndMarker(node.parent)
    : needsToBorrowPrevClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.prev, options)
    : "";
}

function printOpeningTagStartMarker(node) {
  switch (node.type) {
    case "ieConditionalComment":
    case "ieConditionalStartComment":
      return `<!--[if ${node.condition}`;
    case "ieConditionalEndComment":
      return "<!--<!";
    case "interpolation":
      return "{{";
    case "docType":
      return "<!DOCTYPE";
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
  assert(!node.isSelfClosing);
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

module.exports = {
  printOpeningTag,
  printOpeningTagStart,
  printOpeningTagPrefix,
  printOpeningTagStartMarker,
  printOpeningTagEndMarker,
  needsToBorrowNextOpeningTagStartMarker,
  needsToBorrowParentOpeningTagEndMarker,
};
