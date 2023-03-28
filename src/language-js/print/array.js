import { printDanglingComments } from "../../main/comments/print.js";
import {
  line,
  softline,
  hardline,
  group,
  indent,
  ifBreak,
  fill,
} from "../../document/builders.js";
import hasNewline from "../../utils/has-newline.js";
import {
  shouldPrintComma,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
  isNumericLiteral,
  isSignedNumericLiteral,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
} from "../utils/index.js";
import { locStart } from "../loc.js";

import { printOptionalToken } from "./misc.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

function printEmptyArray(path, options, openBracket, closeBracket) {
  const { node } = path;
  if (!hasComment(node, CommentCheckFlags.Dangling)) {
    return [openBracket, closeBracket];
  }
  return group([
    openBracket,
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
    parts.push(printEmptyArray(path, options, openBracket, closeBracket));
  } else {
    const lastElem = elements.at(-1);
    const canHaveTrailingComma = lastElem?.type !== "RestElement";

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
              ? printArrayItemsConcisely(path, options, print, trailingComma)
              : [
                  printArrayItems(path, options, elementsProperty, print),
                  trailingComma,
                ],
            printDanglingComments(path, options),
          ]),
          softline,
          closeBracket,
        ],
        { shouldBreak, id: groupId }
      )
    );
  }

  parts.push(
    printOptionalToken(path),
    printTypeAnnotationProperty(path, print)
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
            })
        )
    )
  );
}

function printArrayItems(path, options, elementsProperty, print) {
  const parts = [];

  path.each(({ node, isLast }) => {
    parts.push(node ? group(print()) : "");

    if (!isLast) {
      parts.push([
        ",",
        line,
        node && isNextLineEmpty(node, options) ? softline : "",
      ]);
    }
  }, elementsProperty);

  return parts;
}

function printArrayItemsConcisely(path, options, print, trailingComma) {
  const parts = [];

  path.each(({ node, isLast, next }) => {
    parts.push([print(), isLast ? trailingComma : ","]);

    if (!isLast) {
      parts.push(
        isNextLineEmpty(node, options)
          ? [hardline, hardline]
          : hasComment(next, CommentCheckFlags.Leading | CommentCheckFlags.Line)
          ? hardline
          : line
      );
    }
  }, "elements");

  return fill(parts);
}

export { printArray, isConciselyPrintedArray };
