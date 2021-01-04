"use strict";

/** @typedef {import("../../document").Doc} Doc */

const {
  builders: { conditionalGroup, group, hardline, ifBreak, join, line },
} = require("../../document");
const {
  hasLeadingComments,
  hasMiddleComments,
  hasTrailingComment,
  hasEndComments,
  isNode,
  isEmptyNode,
  isInlineNode,
} = require("../utils");
const { alignWithSpaces } = require("./misc");

function printMappingItem(node, parentNode, path, print, options) {
  const { key, value } = node;

  const isEmptyMappingKey = isEmptyNode(key);
  const isEmptyMappingValue = isEmptyNode(value);

  if (isEmptyMappingKey && isEmptyMappingValue) {
    return ": ";
  }

  const printedKey = path.call(print, "key");
  const spaceBeforeColon = needsSpaceInFrontOfMappingValue(node) ? " " : "";

  if (isEmptyMappingValue) {
    if (node.type === "flowMappingItem" && parentNode.type === "flowMapping") {
      return printedKey;
    }

    if (
      node.type === "mappingItem" &&
      isAbsolutelyPrintedAsSingleLineNode(key.content, options) &&
      !hasTrailingComment(key.content) &&
      (!parentNode.tag || parentNode.tag.value !== "tag:yaml.org,2002:set")
    ) {
      return [printedKey, spaceBeforeColon, ":"];
    }

    return ["? ", alignWithSpaces(2, printedKey)];
  }

  const printedValue = path.call(print, "value");
  if (isEmptyMappingKey) {
    return [": ", alignWithSpaces(2, printedValue)];
  }

  // force explicit Key
  if (hasLeadingComments(value) || !isInlineNode(key.content)) {
    return [
      "? ",
      alignWithSpaces(2, printedKey),
      hardline,
      join(
        "",
        path
          .map(print, "value", "leadingComments")
          .map((comment) => [comment, hardline])
      ),
      ": ",
      alignWithSpaces(2, printedValue),
    ];
  }

  // force singleline
  if (
    isSingleLineNode(key.content) &&
    !hasLeadingComments(key.content) &&
    !hasMiddleComments(key.content) &&
    !hasTrailingComment(key.content) &&
    !hasEndComments(key) &&
    !hasLeadingComments(value.content) &&
    !hasMiddleComments(value.content) &&
    !hasEndComments(value) &&
    isAbsolutelyPrintedAsSingleLineNode(value.content, options)
  ) {
    return [printedKey, spaceBeforeColon, ": ", printedValue];
  }

  const groupId = Symbol("mappingKey");
  const groupedKey = group([
    ifBreak("? "),
    group(alignWithSpaces(2, printedKey), { id: groupId }),
  ]);
  const breakValue = [hardline, ": ", alignWithSpaces(2, printedValue)];
  /** @type {Doc[]} */
  const flatValueParts = [spaceBeforeColon, ":"];
  if (
    hasLeadingComments(value.content) ||
    (hasEndComments(value) &&
      value.content &&
      !isNode(value.content, ["mapping", "sequence"])) ||
    (parentNode.type === "mapping" &&
      hasTrailingComment(key.content) &&
      isInlineNode(value.content)) ||
    (isNode(value.content, ["mapping", "sequence"]) &&
      value.content.tag === null &&
      value.content.anchor === null)
  ) {
    flatValueParts.push(hardline);
  } else if (value.content) {
    flatValueParts.push(line);
  }
  flatValueParts.push(printedValue);
  const flatValue = alignWithSpaces(options.tabWidth, flatValueParts);

  return conditionalGroup([
    [groupedKey, ifBreak(breakValue, flatValue, { groupId })],
  ]);
}

function isAbsolutelyPrintedAsSingleLineNode(node, options) {
  if (!node) {
    return true;
  }

  switch (node.type) {
    case "plain":
    case "quoteSingle":
    case "quoteDouble":
      break;
    case "alias":
      return true;
    default:
      return false;
  }

  if (options.proseWrap === "preserve") {
    return node.position.start.line === node.position.end.line;
  }

  if (
    // backslash-newline
    /\\$/m.test(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      )
    )
  ) {
    return false;
  }

  switch (options.proseWrap) {
    case "never":
      return !node.value.includes("\n");
    case "always":
      return !/[\n ]/.test(node.value);
    // istanbul ignore next
    default:
      return false;
  }
}

function needsSpaceInFrontOfMappingValue(node) {
  return node.key.content && node.key.content.type === "alias";
}

function isSingleLineNode(node) {
  /* istanbul ignore next */
  if (!node) {
    return true;
  }

  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
      return node.position.start.line === node.position.end.line;
    case "alias":
      return true;
    default:
      return false;
  }
}

module.exports = printMappingItem;
