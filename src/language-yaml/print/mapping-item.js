"use strict";

const {
  builders: {
    align,
    conditionalGroup,
    concat,
    group,
    hardline,
    ifBreak,
    join,
    line,
  },
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
  const isEmptyMappingKey = isEmptyNode(node.key);
  const isEmptyMappingValue = isEmptyNode(node.value);
  const indentWithSpaces = (doc) => align(" ".repeat(options.tabWidth), doc);

  if (isEmptyMappingKey && isEmptyMappingValue) {
    return concat([": "]);
  }

  const key = path.call(print, "key");
  const value = path.call(print, "value");

  if (isEmptyMappingValue) {
    return node.type === "flowMappingItem" && parentNode.type === "flowMapping"
      ? key
      : node.type === "mappingItem" &&
        isAbsolutelyPrintedAsSingleLineNode(node.key.content, options) &&
        !hasTrailingComment(node.key.content) &&
        (!parentNode.tag || parentNode.tag.value !== "tag:yaml.org,2002:set")
      ? concat([key, needsSpaceInFrontOfMappingValue(node) ? " " : "", ":"])
      : concat(["? ", alignWithSpaces(2, key)]);
  }

  if (isEmptyMappingKey) {
    return concat([": ", alignWithSpaces(2, value)]);
  }

  const groupId = Symbol("mappingKey");

  const forceExplicitKey =
    hasLeadingComments(node.value) || !isInlineNode(node.key.content);

  return forceExplicitKey
    ? concat([
        "? ",
        alignWithSpaces(2, key),
        hardline,
        join(
          "",
          path
            .map(print, "value", "leadingComments")
            .map((comment) => concat([comment, hardline]))
        ),
        ": ",
        alignWithSpaces(2, value),
      ])
    : // force singleline
    isSingleLineNode(node.key.content) &&
      !hasLeadingComments(node.key.content) &&
      !hasMiddleComments(node.key.content) &&
      !hasTrailingComment(node.key.content) &&
      !hasEndComments(node.key) &&
      !hasLeadingComments(node.value.content) &&
      !hasMiddleComments(node.value.content) &&
      !hasEndComments(node.value) &&
      isAbsolutelyPrintedAsSingleLineNode(node.value.content, options)
    ? concat([
        key,
        needsSpaceInFrontOfMappingValue(node) ? " " : "",
        ": ",
        value,
      ])
    : conditionalGroup([
        concat([
          group(
            concat([
              ifBreak("? "),
              group(alignWithSpaces(2, key), { id: groupId }),
            ])
          ),
          ifBreak(
            concat([hardline, ": ", alignWithSpaces(2, value)]),
            indentWithSpaces(
              concat([
                needsSpaceInFrontOfMappingValue(node) ? " " : "",
                ":",
                hasLeadingComments(node.value.content) ||
                (hasEndComments(node.value) &&
                  node.value.content &&
                  !isNode(node.value.content, ["mapping", "sequence"])) ||
                (parentNode.type === "mapping" &&
                  hasTrailingComment(node.key.content) &&
                  isInlineNode(node.value.content)) ||
                (isNode(node.value.content, ["mapping", "sequence"]) &&
                  node.value.content.tag === null &&
                  node.value.content.anchor === null)
                  ? hardline
                  : !node.value.content
                  ? ""
                  : line,
                value,
              ])
            ),
            { groupId }
          ),
        ]),
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
