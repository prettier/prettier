import {
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utils/has-newline.js";
import isNextLineEmptyAfterIndex from "../../utils/is-next-line-empty.js";
import skipInlineComment from "../../utils/skip-inline-comment.js";
import skipTrailingComment from "../../utils/skip-trailing-comment.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  hasComment,
  isArrayOrTupleExpression,
  isNumericLiteral,
  isObjectOrRecordExpression,
  isSignedNumericLiteral,
  shouldPrintComma,
} from "../utils/index.js";
import { printOptionalToken } from "./misc.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

function printEmptyArrayElements(path, options, openBracket, closeBracket) {
  const { node } = path;
  const inexact = node.inexact ? "..." : "";
  if (!hasComment(node, CommentCheckFlags.Dangling)) {
    return [openBracket, inexact, closeBracket];
  }
  return group([
    openBracket,
    inexact,
    printDanglingComments(path, options, { indent: true }),
    softline,
    closeBracket,
  ]);
}

/*
- `ArrayExpression`
- `TupleExpression`
- `ArrayPattern`
- `TSTupleType`(TypeScript)
- `TupleTypeAnnotation`(Flow)
*/
function printArray(path, options, print) {
  const { node } = path;
  /** @type{Doc[]} */
  const parts = [];

  const openBracket = node.type === "TupleExpression" ? "#[" : "[";
  const closeBracket = "]";
  const elementsProperty =
    // TODO: Remove `types` when babel changes AST of `TupleTypeAnnotation`
    node.type === "TupleTypeAnnotation" && node.types
      ? "types"
      : node.type === "TSTupleType" || node.type === "TupleTypeAnnotation"
        ? "elementTypes"
        : "elements";
  const elements = node[elementsProperty];
  if (elements.length === 0) {
    parts.push(
      printEmptyArrayElements(path, options, openBracket, closeBracket),
    );
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
      !options.__inJestEach &&
      elements.length > 1 &&
      elements.every((element, i, elements) => {
        const elementType = element?.type;
        if (
          !isArrayOrTupleExpression(element) &&
          !isObjectOrRecordExpression(element)
        ) {
          return false;
        }

        const nextElement = elements[i + 1];
        if (nextElement && elementType !== nextElement.type) {
          return false;
        }

        const itemsKey = isArrayOrTupleExpression(element)
          ? "elements"
          : "properties";

        return element[itemsKey] && element[itemsKey].length > 1;
      });

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
          openBracket,
          indent([
            softline,
            shouldUseConciseFormatting
              ? printArrayElementsConcisely(path, options, print, trailingComma)
              : [
                  printArrayElements(
                    path,
                    options,
                    elementsProperty,
                    node.inexact,
                    print,
                  ),
                  trailingComma,
                ],
            printDanglingComments(path, options),
          ]),
          softline,
          closeBracket,
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
    isArrayOrTupleExpression(node) &&
    node.elements.length > 1 &&
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
  const skipComment = (idx) =>
    skipInlineComment(text, skipTrailingComment(text, idx));

  const skipToComma = (currentIdx) =>
    text[currentIdx] === ","
      ? currentIdx
      : skipToComma(skipComment(currentIdx + 1));

  return isNextLineEmptyAfterIndex(text, skipToComma(locEnd(node)));
}

function printArrayElements(path, options, elementsProperty, inexact, print) {
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
