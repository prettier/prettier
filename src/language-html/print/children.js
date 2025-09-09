import {
  breakParent,
  group,
  hardline,
  ifBreak,
  line,
  softline,
} from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import htmlWhitespaceUtils from "../../utils/html-whitespace-utils.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import {
  forceBreakChildren,
  forceNextEmptyLine,
  hasPrettierIgnore,
  isTextLikeNode,
  preferHardlineAsLeadingSpaces,
} from "../utils/index.js";
import {
  needsToBorrowNextOpeningTagStartMarker,
  needsToBorrowParentClosingTagStartMarker,
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTagEndMarker,
  printClosingTagSuffix,
  printOpeningTagPrefix,
  printOpeningTagStartMarker,
} from "./tag.js";

function getEndLocation(node) {
  const endLocation = locEnd(node);

  // Element can be unclosed
  if (
    node.type === "element" &&
    !node.endSourceSpan &&
    isNonEmptyArray(node.children)
  ) {
    return Math.max(endLocation, getEndLocation(node.children.at(-1)));
  }

  return endLocation;
}

function printChild(path, options, print) {
  const child = path.node;

  if (hasPrettierIgnore(child)) {
    const endLocation = getEndLocation(child);

    return [
      printOpeningTagPrefix(child, options),
      replaceEndOfLine(
        htmlWhitespaceUtils.trimEnd(
          options.originalText.slice(
            locStart(child) +
              (child.prev && needsToBorrowNextOpeningTagStartMarker(child.prev)
                ? printOpeningTagStartMarker(child).length
                : 0),
            endLocation -
              (child.next && needsToBorrowPrevClosingTagEndMarker(child.next)
                ? printClosingTagEndMarker(child, options).length
                : 0),
          ),
        ),
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
            needsToBorrowParentClosingTagStartMarker(
              prevNode.lastChild.lastChild,
            ))
        ? hardline
        : nextNode.hasLeadingSpaces
          ? line
          : softline;
}

function printChildren(path, options, print) {
  const { node } = path;

  if (forceBreakChildren(node)) {
    return [
      breakParent,

      ...path.map(() => {
        const childNode = path.node;
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
          printChild(path, options, print),
        ];
      }, "children"),
    ];
  }

  const groupIds = node.children.map(() => Symbol(""));
  return path.map(({ node: childNode, index: childIndex }) => {
    if (isTextLikeNode(childNode)) {
      if (childNode.prev && isTextLikeNode(childNode.prev)) {
        const prevBetweenLine = printBetweenLine(childNode.prev, childNode);
        if (prevBetweenLine) {
          if (forceNextEmptyLine(childNode.prev)) {
            return [hardline, hardline, printChild(path, options, print)];
          }
          return [prevBetweenLine, printChild(path, options, print)];
        }
      }
      return printChild(path, options, print);
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
      } else if (isTextLikeNode(childNode.prev)) {
        leadingParts.push(prevBetweenLine);
      } else {
        leadingParts.push(
          ifBreak("", softline, {
            groupId: groupIds[childIndex - 1],
          }),
        );
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
        group([printChild(path, options, print), ...trailingParts], {
          id: groupIds[childIndex],
        }),
      ]),
      ...nextParts,
    ];
  }, "children");
}

export { printChildren };
