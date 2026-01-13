import {
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import isNextLineEmptyAfterIndex from "../../utilities/is-next-line-empty.js";
import skipInlineComment from "../../utilities/skip-inline-comment.js";
import skipTrailingComment from "../../utilities/skip-trailing-comment.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  hasComment,
  isArrayExpression,
  isNumericLiteral,
  isObjectExpression,
  isSignedNumericLiteral,
  isTupleType,
  shouldPrintComma,
} from "../utilities/index.js";
import {
  printDanglingCommentsInList,
  printOptionalToken,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @import {Doc} from "../../document/index.js" */

/*
- `ArrayExpression`
- `ArrayPattern`
- `TSTupleType`(TypeScript)
- `TupleTypeAnnotation`(Flow)
*/
function printArray(path, options, print) {
  const { node } = path;
  /** @type{Doc[]} */
  const parts = [];

  const elementsProperty = isTupleType(node) ? "elementTypes" : "elements";
  const elements = node[elementsProperty];
  if (elements.length === 0 && !node.inexact) {
    parts.push(group(["[", printDanglingCommentsInList(path, options), "]"]));
  } else {
    const lastElem = elements.at(-1);
    const canHaveTrailingComma =
      lastElem?.type !== "RestElement" && !node.inexact;

    // JavaScript allows you to have empty elements in an array which
    // changes its length based on the number of commas. The algorithm
    // is that if the last argument is null, we need to force insert
    // a comma to ensure JavaScript recognizes it.
    //   [,].length === 1
    //   [1,].length === 1
    //   [1,,].length === 2
    //
    // Note that getLast returns null if the array is empty, but
    // we already check for an empty array just above so we are safe
    const needsForcedTrailingComma = lastElem === null;

    const groupId = Symbol("array");

    const shouldBreak =
      (!options.__inJestEach &&
        elements.length > 1 &&
        elements.every((element, i, elements) => {
          const elementType = element?.type;
          if (!isArrayExpression(element) && !isObjectExpression(element)) {
            return false;
          }

          const nextElement = elements[i + 1];
          if (nextElement && elementType !== nextElement.type) {
            return false;
          }

          const itemsKey = isArrayExpression(element)
            ? "elements"
            : "properties";

          return element[itemsKey] && element[itemsKey].length > 1;
        })) ||
      hasComment(node, CommentCheckFlags.Dangling | CommentCheckFlags.Line);

    const shouldUseConciseFormatting = isConciselyPrintedArray(node, options);

    const trailingComma = !canHaveTrailingComma
      ? ""
      : needsForcedTrailingComma
        ? ","
        : !shouldPrintComma(options)
          ? ""
          : shouldUseConciseFormatting
            ? ifBreak(",", "", { groupId })
            : ifBreak(",");

    parts.push(
      group(
        [
          "[",
          indent([
            softline,
            shouldUseConciseFormatting
              ? printArrayElementsConcisely(path, options, print, trailingComma)
              : [
                  printArrayElements(
                    path,
                    options,
                    print,
                    elementsProperty,
                    node.inexact,
                  ),
                  trailingComma,
                ],
            printDanglingComments(path, options),
          ]),
          softline,
          "]",
        ],
        { shouldBreak, id: groupId },
      ),
    );
  }

  parts.push(
    printOptionalToken(path),
    printTypeAnnotationProperty(path, print),
  );

  return parts;
}

function isConciselyPrintedArray(node, options) {
  return (
    isArrayExpression(node) &&
    node.elements.length > 0 &&
    node.elements.every(
      (element) =>
        element &&
        (isNumericLiteral(element) ||
          (isSignedNumericLiteral(element) && !hasComment(element.argument))) &&
        !hasComment(
          element,
          CommentCheckFlags.Trailing | CommentCheckFlags.Line,
          (comment) =>
            !hasNewline(options.originalText, locStart(comment), {
              backwards: true,
            }),
        ),
    )
  );
}

function isLineAfterElementEmpty({ node }, { originalText: text }) {
  let currentIdx = locEnd(node);
  if (currentIdx === locStart(node)) {
    return false;
  }

  const { length } = text;
  while (currentIdx < length) {
    if (text[currentIdx] === ",") {
      break;
    }

    currentIdx = skipInlineComment(
      text,
      skipTrailingComment(text, currentIdx + 1),
    );
  }

  return isNextLineEmptyAfterIndex(text, currentIdx);
}

function printArrayElements(path, options, print, elementsProperty, inexact) {
  const parts = [];

  path.each(({ node, isLast }) => {
    parts.push(node ? group(print()) : "");

    if (!isLast || inexact) {
      parts.push([
        ",",
        line,
        node && isLineAfterElementEmpty(path, options) ? softline : "",
      ]);
    }
  }, elementsProperty);

  if (inexact) {
    parts.push("...");
  }

  return parts;
}

function printArrayElementsConcisely(path, options, print, trailingComma) {
  const parts = [];

  path.each(({ isLast, next }) => {
    parts.push([print(), isLast ? trailingComma : ","]);

    if (!isLast) {
      parts.push(
        isLineAfterElementEmpty(path, options)
          ? [hardline, hardline]
          : hasComment(next, CommentCheckFlags.Leading | CommentCheckFlags.Line)
            ? hardline
            : line,
      );
    }
  }, "elements");

  return fill(parts);
}

export { isConciselyPrintedArray, printArray };
