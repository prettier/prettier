import {
  breakParent,
  group,
  hardline,
  ifBreak,
  line,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import htmlWhitespace from "../../utilities/html-whitespace.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import {
  forceBreakChildren,
  forceNextEmptyLine,
  hasPrettierIgnore,
  isPrettierIgnoreEnd,
  isPrettierIgnoreStart,
  isTextLikeNode,
  preferHardlineAsLeadingSpaces,
} from "../utilities/index.js";
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
    node.kind === "element" &&
    !node.endSourceSpan &&
    isNonEmptyArray(node.children)
  ) {
    return Math.max(endLocation, getEndLocation(node.children.at(-1)));
  }

  return endLocation;
}

// Returns the index of the comment closing the ignore range opened at
// startIndex. Nested ranges are supported; an unclosed start ignores
// everything until the end of the parent.
function getIgnoreRangeEndIndex(children, startIndex) {
  let depth = 0;
  for (let i = startIndex; i < children.length; i++) {
    if (isPrettierIgnoreStart(children[i])) {
      depth++;
    } else if (isPrettierIgnoreEnd(children[i])) {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return children.length - 1;
}

// Maps ignore-start child indexes to their matching ignore-end index and
// collects every index that is swallowed by a range.
function getIgnoreRanges(children) {
  const ranges = new Map();
  const skipped = new Set();
  for (let i = 0; i < children.length; i++) {
    if (isPrettierIgnoreStart(children[i])) {
      const endIndex = getIgnoreRangeEndIndex(children, i);
      ranges.set(i, endIndex);
      for (let j = i + 1; j <= endIndex; j++) {
        skipped.add(j);
      }
    }
  }
  return { ranges, skipped };
}

// The node a child should compute its leading between-line against: skip
// over children swallowed by an ignore range.
function effectivePrevNode(children, skipped, index) {
  let prevIndex = index - 1;
  while (prevIndex >= 0 && skipped.has(prevIndex)) {
    prevIndex--;
  }
  return prevIndex >= 0 ? children[prevIndex] : null;
}

function printChild(path, options, print) {
  const child = path.node;

  if (hasPrettierIgnore(child)) {
    const endLocation = getEndLocation(child);

    return [
      printOpeningTagPrefix(child, options),
      replaceEndOfLine(
        htmlWhitespace.trimEnd(
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
  if (isTextLikeNode(prevNode) && isTextLikeNode(nextNode)) {
    if (prevNode.isTrailingSpaceSensitive) {
      if (prevNode.hasTrailingSpaces) {
        if (preferHardlineAsLeadingSpaces(nextNode)) {
          return hardline;
        }

        return line;
      }

      return "";
    }

    if (preferHardlineAsLeadingSpaces(nextNode)) {
      return hardline;
    }

    return softline;
  }

  if (
    needsToBorrowPrevClosingTagEndMarker(nextNode) &&
    prevNode.kind === "element" &&
    prevNode.children.length === 1 &&
    prevNode.firstChild.kind === "interpolation" &&
    (prevNode.hasLeadingSpaces || nextNode.kind === "text")
  ) {
    return nextNode.kind === "text" ? softline : "";
  }

  if (
    (needsToBorrowNextOpeningTagStartMarker(prevNode) &&
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
        (nextNode.kind === "element" && nextNode.attrs.length > 0))) ||
    /**
     *     <img
     *       src="long"
     *                 ~
     *     />123
     */
    (prevNode.kind === "element" &&
      prevNode.isSelfClosing &&
      needsToBorrowPrevClosingTagEndMarker(nextNode))
  ) {
    return "";
  }

  /**
   *     <div>{{ x }}<!-- comment --></div>
   *                 ~
   */
  if (
    nextNode.kind === "comment" &&
    nextNode.isLeadingSpaceSensitive &&
    !nextNode.hasLeadingSpaces
  ) {
    return softline;
  }

  if (
    !nextNode.isLeadingSpaceSensitive ||
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
  ) {
    return hardline;
  }

  if (nextNode.hasLeadingSpaces) {
    return line;
  }

  return softline;
}

function printChildren(path, options, print) {
  const { node } = path;

  const { ranges, skipped } = getIgnoreRanges(node.children);
  const printIgnoredRange = (startIndex) => {
    const endIndex = ranges.get(startIndex);
    const startNode = node.children[startIndex];
    const endNode = node.children[endIndex];
    // Print the whole range (including both marker comments) verbatim.
    return replaceEndOfLine(
      options.originalText.slice(locStart(startNode), getEndLocation(endNode)),
    );
  };

  if (forceBreakChildren(node)) {
    return [
      breakParent,

      ...path.map(() => {
        const childNode = path.node;
        const childIndex = path.index;
        if (skipped.has(childIndex)) {
          return "";
        }
        const prevNode = effectivePrevNode(node.children, skipped, childIndex);
        const prevBetweenLine = !prevNode
          ? ""
          : printBetweenLine(prevNode, childNode);
        if (ranges.has(childIndex)) {
          return [
            !prevBetweenLine
              ? ""
              : [prevBetweenLine, forceNextEmptyLine(prevNode) ? hardline : ""],
            printIgnoredRange(childIndex),
          ];
        }
        return [
          !prevBetweenLine
            ? ""
            : [prevBetweenLine, forceNextEmptyLine(prevNode) ? hardline : ""],
          printChild(path, options, print),
        ];
      }, "children"),
    ];
  }

  const groupIds = node.children.map(() => Symbol(""));
  return path.map(({ node: childNode, index: childIndex }) => {
    if (skipped.has(childIndex)) {
      return "";
    }
    if (ranges.has(childIndex)) {
      // Mirror the text-like child semantics: the leading between-line is
      // only emitted when the previous sibling is text-like as well.
      const prevNode = effectivePrevNode(node.children, skipped, childIndex);
      const prevBetweenLine =
        prevNode && isTextLikeNode(prevNode)
          ? printBetweenLine(prevNode, childNode)
          : "";
      if (prevBetweenLine) {
        if (forceNextEmptyLine(prevNode)) {
          return [hardline, hardline, printIgnoredRange(childIndex)];
        }
        return [prevBetweenLine, printIgnoredRange(childIndex)];
      }
      return printIgnoredRange(childIndex);
    }
    const effectivePrev = effectivePrevNode(node.children, skipped, childIndex);
    if (isTextLikeNode(childNode)) {
      if (effectivePrev && isTextLikeNode(effectivePrev)) {
        const prevBetweenLine = printBetweenLine(effectivePrev, childNode);
        if (prevBetweenLine) {
          if (forceNextEmptyLine(effectivePrev)) {
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

    const prevBetweenLine = effectivePrev
      ? printBetweenLine(effectivePrev, childNode)
      : "";

    const nextBetweenLine = childNode.next
      ? printBetweenLine(childNode, childNode.next)
      : "";

    if (prevBetweenLine) {
      if (forceNextEmptyLine(effectivePrev)) {
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
