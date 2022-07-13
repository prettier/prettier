import { printDanglingComments } from "../../main/comments.js";
import {
  line,
  softline,
  hardline,
  group,
  indent,
  ifBreak,
  fill,
} from "../../document/builders.js";
import { getLast, hasNewline } from "../../common/util.js";
import {
  shouldPrintComma,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
  isNumericLiteral,
  isSignedNumericLiteral,
} from "../utils/index.js";
import { locStart } from "../loc.js";

import { printOptionalToken, printTypeAnnotation } from "./misc.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

async function printArray(path, options, print) {
  const node = path.getValue();
  /** @type{Doc[]} */
  const parts = [];

  const openBracket = node.type === "TupleExpression" ? "#[" : "[";
  const closeBracket = "]";
  if (node.elements.length === 0) {
    if (!hasComment(node, CommentCheckFlags.Dangling)) {
      parts.push(openBracket, closeBracket);
    } else {
      parts.push(
        group([
          openBracket,
          printDanglingComments(path, options),
          softline,
          closeBracket,
        ])
      );
    }
  } else {
    const lastElem = getLast(node.elements);
    const canHaveTrailingComma = !(lastElem && lastElem.type === "RestElement");

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
      node.elements.length > 1 &&
      node.elements.every((element, i, elements) => {
        const elementType = element && element.type;
        if (
          elementType !== "ArrayExpression" &&
          elementType !== "ObjectExpression"
        ) {
          return false;
        }

        const nextElement = elements[i + 1];
        if (nextElement && elementType !== nextElement.type) {
          return false;
        }

        const itemsKey =
          elementType === "ArrayExpression" ? "elements" : "properties";

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
              ? await printArrayItemsConcisely(path, options, print, trailingComma)
              : [
                  await printArrayItems(path, options, "elements", print),
                  trailingComma,
                ],
            printDanglingComments(path, options, /* sameIndent */ true),
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
    await printTypeAnnotation(path, options, print)
  );

  return parts;
}

function isConciselyPrintedArray(node, options) {
  return (
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

async function printArrayItems(path, options, printPath, print) {
  const printedElements = [];
  let separatorParts = [];

  await path.each(async (childPath) => {
    printedElements.push(separatorParts, group(await print()));

    separatorParts = [",", line];
    if (
      childPath.getValue() &&
      isNextLineEmpty(childPath.getValue(), options)
    ) {
      separatorParts.push(softline);
    }
  }, printPath);

  return printedElements;
}

async function printArrayItemsConcisely(path, options, print, trailingComma) {
  const parts = [];

  await path.each(async (childPath, i, elements) => {
    const isLast = i === elements.length - 1;

    parts.push([await print(), isLast ? trailingComma : ","]);

    if (!isLast) {
      parts.push(
        isNextLineEmpty(childPath.getValue(), options)
          ? [hardline, hardline]
          : hasComment(
              elements[i + 1],
              CommentCheckFlags.Leading | CommentCheckFlags.Line
            )
          ? hardline
          : line
      );
    }
  }, "elements");

  return fill(parts);
}

export { printArray, printArrayItems, isConciselyPrintedArray };
