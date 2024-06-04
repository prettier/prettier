import {
  addAlignmentToDoc,
  align,
  group,
  hardline,
  indent,
  join,
  label,
  lineSuffixBoundary,
  softline,
} from "../../document/builders.js";
import { printDocToString } from "../../document/printer.js";
import { mapDoc } from "../../document/utils.js";
import getIndentSize from "../../utils/get-indent-size.js";
import getStringWidth from "../../utils/get-string-width.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import {
  hasComment,
  isBinaryCastExpression,
  isBinaryish,
  isMemberExpression,
} from "../utils/index.js";

function printTemplateLiteral(path, print, options) {
  const { node } = path;
  const isTemplateLiteral = node.type === "TemplateLiteral";

  if (isTemplateLiteral && isJestEachTemplateLiteral(path)) {
    const printed = printJestEachTemplateLiteral(path, options, print);
    if (printed) {
      return printed;
    }
  }
  let expressionsKey = "expressions";
  if (node.type === "TSTemplateLiteralType") {
    expressionsKey = "types";
  }
  const parts = [];

  const expressionDocs = path.map(print, expressionsKey);

  parts.push(lineSuffixBoundary, "`");

  let previousQuasiIndentSize = 0;
  path.each(({ index, node: quasi }) => {
    parts.push(print());

    if (quasi.tail) {
      return;
    }

    // For a template literal of the following form:
    //   `someQuery {
    //     ${call({
    //       a,
    //       b,
    //     })}
    //   }`
    // the expression is on its own line (there is a \n in the previous
    // quasi literal), therefore we want to indent the JavaScript
    // expression inside at the beginning of ${ instead of the beginning
    // of the `.
    const { tabWidth } = options;
    const text = quasi.value.raw;
    const indentSize = text.includes("\n")
      ? getIndentSize(text, tabWidth)
      : previousQuasiIndentSize;
    previousQuasiIndentSize = indentSize;

    let expressionDoc = expressionDocs[index];

    const expression = node[expressionsKey][index];

    let interpolationHasNewline = hasNewlineInRange(
      options.originalText,
      locEnd(quasi),
      locStart(node.quasis[index + 1]),
    );

    if (!interpolationHasNewline) {
      // Never add a newline to an interpolation which didn't already have one...
      const renderedExpression = printDocToString(expressionDoc, {
        ...options,
        printWidth: Number.POSITIVE_INFINITY,
      }).formatted;

      // ... unless one will be introduced anyway, e.g. by a nested function.
      // This case is rare, so we can pay the cost of re-rendering.
      if (renderedExpression.includes("\n")) {
        interpolationHasNewline = true;
      } else {
        expressionDoc = renderedExpression;
      }
    }

    // Breaks at the template element boundaries (${ and }) are preferred to breaking
    // in the middle of a MemberExpression
    if (
      interpolationHasNewline &&
      (hasComment(expression) ||
        expression.type === "Identifier" ||
        isMemberExpression(expression) ||
        expression.type === "ConditionalExpression" ||
        expression.type === "SequenceExpression" ||
        isBinaryCastExpression(expression) ||
        isBinaryish(expression))
    ) {
      expressionDoc = [indent([softline, expressionDoc]), softline];
    }

    const aligned =
      indentSize === 0 && text.endsWith("\n")
        ? align(Number.NEGATIVE_INFINITY, expressionDoc)
        : addAlignmentToDoc(expressionDoc, indentSize, tabWidth);

    parts.push(group(["${", aligned, lineSuffixBoundary, "}"]));
  }, "quasis");

  parts.push("`");

  return parts;
}

function printTaggedTemplateLiteral(print) {
  const quasiDoc = print("quasi");
  return label(quasiDoc.label && { tagged: true, ...quasiDoc.label }, [
    print("tag"),
    print("typeParameters"),
    lineSuffixBoundary,
    quasiDoc,
  ]);
}

function printJestEachTemplateLiteral(path, options, print) {
  /**
   * a    | b    | expected
   * ${1} | ${1} | ${2}
   * ${1} | ${2} | ${3}
   * ${2} | ${1} | ${3}
   */
  const { node } = path;
  const headerNames = node.quasis[0].value.raw.trim().split(/\s*\|\s*/);
  if (
    headerNames.length > 1 ||
    headerNames.some((headerName) => headerName.length > 0)
  ) {
    options.__inJestEach = true;
    const expressions = path.map(print, "expressions");
    options.__inJestEach = false;
    const parts = [];
    const stringifiedExpressions = expressions.map(
      (doc) =>
        "${" +
        printDocToString(doc, {
          ...options,
          printWidth: Number.POSITIVE_INFINITY,
          endOfLine: "lf",
        }).formatted +
        "}",
    );

    const tableBody = [{ hasLineBreak: false, cells: [] }];
    for (let i = 1; i < node.quasis.length; i++) {
      const row = tableBody.at(-1);
      const correspondingExpression = stringifiedExpressions[i - 1];

      row.cells.push(correspondingExpression);
      if (correspondingExpression.includes("\n")) {
        row.hasLineBreak = true;
      }

      if (node.quasis[i].value.raw.includes("\n")) {
        tableBody.push({ hasLineBreak: false, cells: [] });
      }
    }

    const maxColumnCount = Math.max(
      headerNames.length,
      ...tableBody.map((row) => row.cells.length),
    );

    const maxColumnWidths = Array.from({ length: maxColumnCount }).fill(0);
    const table = [
      { cells: headerNames },
      ...tableBody.filter((row) => row.cells.length > 0),
    ];
    for (const { cells } of table.filter((row) => !row.hasLineBreak)) {
      for (const [index, cell] of cells.entries()) {
        maxColumnWidths[index] = Math.max(
          maxColumnWidths[index],
          getStringWidth(cell),
        );
      }
    }

    parts.push(
      lineSuffixBoundary,
      "`",
      indent([
        hardline,
        join(
          hardline,
          table.map((row) =>
            join(
              " | ",
              row.cells.map((cell, index) =>
                row.hasLineBreak
                  ? cell
                  : cell +
                    " ".repeat(maxColumnWidths[index] - getStringWidth(cell)),
              ),
            ),
          ),
        ),
      ]),
      hardline,
      "`",
    );
    return parts;
  }
}

function printTemplateExpression(path, print) {
  const { node } = path;
  let printed = print();
  if (hasComment(node)) {
    printed = group([indent([softline, printed]), softline]);
  }
  return ["${", printed, lineSuffixBoundary, "}"];
}

function printTemplateExpressions(path, print) {
  return path.map(
    (path) => printTemplateExpression(path, print),
    "expressions",
  );
}

function escapeTemplateCharacters(doc, raw) {
  return mapDoc(doc, (currentDoc) => {
    if (typeof currentDoc === "string") {
      return raw
        ? currentDoc.replaceAll(/(\\*)`/g, "$1$1\\`")
        : uncookTemplateElementValue(currentDoc);
    }

    return currentDoc;
  });
}

function uncookTemplateElementValue(cookedValue) {
  return cookedValue.replaceAll(/([\\`]|\${)/g, String.raw`\$1`);
}

function isJestEachTemplateLiteral({ node, parent }) {
  /**
   * describe.each`table`(name, fn)
   * describe.only.each`table`(name, fn)
   * describe.skip.each`table`(name, fn)
   * test.each`table`(name, fn)
   * test.only.each`table`(name, fn)
   * test.skip.each`table`(name, fn)
   *
   * Ref: https://github.com/facebook/jest/pull/6102
   */
  const jestEachTriggerRegex = /^[fx]?(?:describe|it|test)$/;
  return (
    parent.type === "TaggedTemplateExpression" &&
    parent.quasi === node &&
    parent.tag.type === "MemberExpression" &&
    parent.tag.property.type === "Identifier" &&
    parent.tag.property.name === "each" &&
    ((parent.tag.object.type === "Identifier" &&
      jestEachTriggerRegex.test(parent.tag.object.name)) ||
      (parent.tag.object.type === "MemberExpression" &&
        parent.tag.object.property.type === "Identifier" &&
        (parent.tag.object.property.name === "only" ||
          parent.tag.object.property.name === "skip") &&
        parent.tag.object.object.type === "Identifier" &&
        jestEachTriggerRegex.test(parent.tag.object.object.name)))
  );
}

export {
  escapeTemplateCharacters,
  printTaggedTemplateLiteral,
  printTemplateExpressions,
  printTemplateLiteral,
  uncookTemplateElementValue,
};
