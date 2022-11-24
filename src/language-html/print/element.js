"use strict";

const {
  builders: {
    breakParent,
    dedentToRoot,
    group,
    ifBreak,
    indentIfBreak,
    indent,
    line,
    softline,
  },
  utils: { replaceTextEndOfLine },
} = require("../../document/index.js");
const getNodeContent = require("../get-node-content.js");
const {
  shouldPreserveContent,
  isScriptLikeTag,
  isVueCustomBlock,
  countParents,
  forceBreakContent,
} = require("../utils/index.js");
const {
  printOpeningTagPrefix,
  printOpeningTag,
  printClosingTagSuffix,
  printClosingTag,
  needsToBorrowPrevClosingTagEndMarker,
  needsToBorrowLastChildClosingTagEndMarker,
} = require("./tag.js");
const { printChildren } = require("./children.js");

function printElement(path, options, print) {
  const node = path.getValue();

  if (shouldPreserveContent(node, options)) {
    return [
      printOpeningTagPrefix(node, options),
      group(printOpeningTag(path, options, print)),
      ...replaceTextEndOfLine(getNodeContent(node, options)),
      ...printClosingTag(node, options),
      printClosingTagSuffix(node, options),
    ];
  }
  /**
   * do not break:
   *
   *     <div>{{
   *         ~
   *       interpolation
   *     }}</div>
   *            ~
   *
   * exception: break if the opening tag breaks
   *
   *     <div
   *       long
   *           ~
   *       >{{
   *         interpolation
   *       }}</div
   *              ~
   *     >
   */
  const shouldHugContent =
    node.children.length === 1 &&
    node.firstChild.type === "interpolation" &&
    node.firstChild.isLeadingSpaceSensitive &&
    !node.firstChild.hasLeadingSpaces &&
    node.lastChild.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces;

  const attrGroupId = Symbol("element-attr-group-id");

  const printTag = (doc) =>
    group([
      group(printOpeningTag(path, options, print), { id: attrGroupId }),
      doc,
      printClosingTag(node, options),
    ]);

  const printChildrenDoc = (childrenDoc) => {
    if (shouldHugContent) {
      return indentIfBreak(childrenDoc, { groupId: attrGroupId });
    }
    if (
      (isScriptLikeTag(node) || isVueCustomBlock(node, options)) &&
      node.parent.type === "root" &&
      options.parser === "vue" &&
      !options.vueIndentScriptAndStyle
    ) {
      return childrenDoc;
    }
    return indent(childrenDoc);
  };

  const printLineBeforeChildren = () => {
    if (shouldHugContent) {
      return ifBreak(softline, "", { groupId: attrGroupId });
    }
    if (
      node.firstChild.hasLeadingSpaces &&
      node.firstChild.isLeadingSpaceSensitive
    ) {
      return line;
    }
    if (
      node.firstChild.type === "text" &&
      node.isWhitespaceSensitive &&
      node.isIndentationSensitive
    ) {
      return dedentToRoot(softline);
    }
    return softline;
  };

  const printLineAfterChildren = () => {
    const needsToBorrow = node.next
      ? needsToBorrowPrevClosingTagEndMarker(node.next)
      : needsToBorrowLastChildClosingTagEndMarker(node.parent);
    if (needsToBorrow) {
      if (
        node.lastChild.hasTrailingSpaces &&
        node.lastChild.isTrailingSpaceSensitive
      ) {
        return " ";
      }
      return "";
    }
    if (shouldHugContent) {
      return ifBreak(softline, "", { groupId: attrGroupId });
    }
    if (
      node.lastChild.hasTrailingSpaces &&
      node.lastChild.isTrailingSpaceSensitive
    ) {
      return line;
    }
    if (
      (node.lastChild.type === "comment" ||
        (node.lastChild.type === "text" &&
          node.isWhitespaceSensitive &&
          node.isIndentationSensitive)) &&
      new RegExp(
        `\\n[\\t ]{${
          options.tabWidth *
          countParents(
            path,
            (node) => node.parent && node.parent.type !== "root"
          )
        }}$`
      ).test(node.lastChild.value)
    ) {
      return "";
    }
    return softline;
  };

  if (node.children.length === 0) {
    return printTag(
      node.hasDanglingSpaces && node.isDanglingSpaceSensitive ? line : ""
    );
  }

  return printTag([
    forceBreakContent(node) ? breakParent : "",
    printChildrenDoc([
      printLineBeforeChildren(),
      printChildren(path, options, print),
    ]),
    printLineAfterChildren(),
  ]);
}

module.exports = { printElement };
