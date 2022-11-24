"use strict";

const {
  builders: { breakParent, group, ifBreak, line, softline, hardline },
  utils: { replaceTextEndOfLine },
} = require("../../document/index.js");
const { locStart, locEnd } = require("../loc.js");
const {
  forceBreakChildren,
  forceNextEmptyLine,
  isTextLikeNode,
  hasPrettierIgnore,
  preferHardlineAsLeadingSpaces,
} = require("../utils/index.js");
const {
  printOpeningTagPrefix,
  needsToBorrowNextOpeningTagStartMarker,
  printOpeningTagStartMarker,
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTagEndMarker,
  printClosingTagSuffix,
  needsToBorrowParentClosingTagStartMarker,
} = require("./tag.js");

function printChild(childPath, options, print) {
  const child = childPath.getValue();

  if (hasPrettierIgnore(child)) {
    return [
      printOpeningTagPrefix(child, options),
      ...replaceTextEndOfLine(
        options.originalText.slice(
          locStart(child) +
            (child.prev && needsToBorrowNextOpeningTagStartMarker(child.prev)
              ? printOpeningTagStartMarker(child).length
              : 0),
          locEnd(child) -
            (child.next && needsToBorrowPrevClosingTagEndMarker(child.next)
              ? printClosingTagEndMarker(child, options).length
              : 0)
        )
      ),
      printClosingTagSuffix(child, options),
    ];
  }

  return print();
}

function printBetweenLine(prevNode, nextNode) {
  return isTextLikeNode(prevNode) && isTextLikeNode(nextNode)
    ? prevNode.isTrailingSpaceSensitive
      ? prevNode.hasTrailingSpaces
        ? preferHardlineAsLeadingSpaces(nextNode)
          ? hardline
          : line
        : ""
      : preferHardlineAsLeadingSpaces(nextNode)
      ? hardline
      : softline
    : (needsToBorrowNextOpeningTagStartMarker(prevNode) &&
        (hasPrettierIgnore(nextNode) ||
          /**
           *     123<a
           *          ~
           *       ><b>
           */
          nextNode.firstChild ||
          /**
           *     123<!--
           *            ~
           *     -->
           */
          nextNode.isSelfClosing ||
          /**
           *     123<span
           *             ~
           *       attr
           */
          (nextNode.type === "element" && nextNode.attrs.length > 0))) ||
      /**
       *     <img
       *       src="long"
       *                 ~
       *     />123
       */
      (prevNode.type === "element" &&
        prevNode.isSelfClosing &&
        needsToBorrowPrevClosingTagEndMarker(nextNode))
    ? ""
    : !nextNode.isLeadingSpaceSensitive ||
      preferHardlineAsLeadingSpaces(nextNode) ||
      /**
       *       Want to write us a letter? Use our<a
       *         ><b><a>mailing address</a></b></a
       *                                          ~
       *       >.
       */
      (needsToBorrowPrevClosingTagEndMarker(nextNode) &&
        prevNode.lastChild &&
        needsToBorrowParentClosingTagStartMarker(prevNode.lastChild) &&
        prevNode.lastChild.lastChild &&
        needsToBorrowParentClosingTagStartMarker(prevNode.lastChild.lastChild))
    ? hardline
    : nextNode.hasLeadingSpaces
    ? line
    : softline;
}

function printChildren(path, options, print) {
  const node = path.getValue();

  if (forceBreakChildren(node)) {
    return [
      breakParent,

      ...path.map((childPath) => {
        const childNode = childPath.getValue();
        const prevBetweenLine = !childNode.prev
          ? ""
          : printBetweenLine(childNode.prev, childNode);
        return [
          !prevBetweenLine
            ? ""
            : [
                prevBetweenLine,
                forceNextEmptyLine(childNode.prev) ? hardline : "",
              ],
          printChild(childPath, options, print),
        ];
      }, "children"),
    ];
  }

  const groupIds = node.children.map(() => Symbol(""));
  return path.map((childPath, childIndex) => {
    const childNode = childPath.getValue();

    if (isTextLikeNode(childNode)) {
      if (childNode.prev && isTextLikeNode(childNode.prev)) {
        const prevBetweenLine = printBetweenLine(childNode.prev, childNode);
        if (prevBetweenLine) {
          if (forceNextEmptyLine(childNode.prev)) {
            return [hardline, hardline, printChild(childPath, options, print)];
          }
          return [prevBetweenLine, printChild(childPath, options, print)];
        }
      }
      return printChild(childPath, options, print);
    }

    const prevParts = [];
    const leadingParts = [];
    const trailingParts = [];
    const nextParts = [];

    const prevBetweenLine = childNode.prev
      ? printBetweenLine(childNode.prev, childNode)
      : "";

    const nextBetweenLine = childNode.next
      ? printBetweenLine(childNode, childNode.next)
      : "";

    if (prevBetweenLine) {
      if (forceNextEmptyLine(childNode.prev)) {
        prevParts.push(hardline, hardline);
      } else if (prevBetweenLine === hardline) {
        prevParts.push(hardline);
      } else {
        if (isTextLikeNode(childNode.prev)) {
          leadingParts.push(prevBetweenLine);
        } else {
          leadingParts.push(
            ifBreak("", softline, {
              groupId: groupIds[childIndex - 1],
            })
          );
        }
      }
    }

    if (nextBetweenLine) {
      if (forceNextEmptyLine(childNode)) {
        if (isTextLikeNode(childNode.next)) {
          nextParts.push(hardline, hardline);
        }
      } else if (nextBetweenLine === hardline) {
        if (isTextLikeNode(childNode.next)) {
          nextParts.push(hardline);
        }
      } else {
        trailingParts.push(nextBetweenLine);
      }
    }

    return [
      ...prevParts,
      group([
        ...leadingParts,
        group([printChild(childPath, options, print), ...trailingParts], {
          id: groupIds[childIndex],
        }),
      ]),
      ...nextParts,
    ];
  }, "children");
}

module.exports = { printChildren };
