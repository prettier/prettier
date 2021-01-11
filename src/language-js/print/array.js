"use strict";

const { printDanglingComments } = require("../../main/comments");
const {
  builders: { line, softline, group, indent, ifBreak },
} = require("../../document");
const { getLast } = require("../../common/util");
const {
  shouldPrintComma,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
} = require("../utils");

const { printOptionalToken, printTypeAnnotation } = require("./misc");

/** @typedef {import("../../document").Doc} Doc */

function printArray(path, options, print) {
  const n = path.getValue();
  /** @type{Doc[]} */
  const parts = [];

  const openBracket = n.type === "TupleExpression" ? "#[" : "[";
  const closeBracket = "]";
  if (n.elements.length === 0) {
    if (!hasComment(n, CommentCheckFlags.Dangling)) {
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
    const lastElem = getLast(n.elements);
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
    const needsForcedTrailingComma = canHaveTrailingComma && lastElem === null;

    const shouldBreak =
      !options.__inJestEach &&
      n.elements.length > 1 &&
      n.elements.every((element, i, elements) => {
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

    parts.push(
      group(
        [
          openBracket,
          indent([softline, printArrayItems(path, options, "elements", print)]),
          needsForcedTrailingComma ? "," : "",
          ifBreak(
            canHaveTrailingComma &&
              !needsForcedTrailingComma &&
              shouldPrintComma(options)
              ? ","
              : ""
          ),
          printDanglingComments(path, options, /* sameIndent */ true),
          softline,
          closeBracket,
        ],
        { shouldBreak }
      )
    );
  }

  parts.push(
    printOptionalToken(path),
    printTypeAnnotation(path, options, print)
  );

  return parts;
}

function printArrayItems(path, options, printPath, print) {
  const printedElements = [];
  let separatorParts = [];

  path.each((childPath) => {
    printedElements.push(separatorParts);
    printedElements.push(group(print(childPath)));

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

module.exports = { printArray, printArrayItems };
