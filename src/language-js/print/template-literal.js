import {
  addAlignmentToDoc,
  align,
  group,
  hardline,
  indent,
  join,
  label,
  lineSuffixBoundary,
  mapDoc,
  printDocToString,
  softline,
} from "../../document/index.js";
import getIndentSize from "../../utilities/get-indent-size.js";
import getStringWidth from "../../utilities/get-string-width.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
  isBinaryCastExpression,
  isBinaryish,
  isMemberExpression,
} from "../utilities/index.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

/*
- `TemplateLiteral`
- `TSTemplateLiteralType` (TypeScript)
*/
function printTemplateLiteral(path, options, print) {
  if (isJestEachTemplateLiteral(path)) {
    const printed = printJestEachTemplateLiteral(path, options, print);
    if (printed) {
      return printed;
    }
  }

  const expressionDocs = printTemplateExpressions(path, options, print);
  const parts = path.map(
    ({ isLast, index }) => [print(), isLast ? "" : expressionDocs[index]],
    "quasis",
  );

  return [lineSuffixBoundary, "`", ...parts, "`"];
}

function printTaggedTemplateExpression(path, options, print) {
  const quasiDoc = print("quasi");
  const { node } = path;

  /** @type {Doc} */
  let space = "";
  const quasiLeadingComment = getComments(
    node.quasi,
    CommentCheckFlags.Leading,
  )[0];
  if (quasiLeadingComment) {
    if (
      hasNewlineInRange(
        options.originalText,
        locEnd(node.typeArguments ?? node.tag),
        locStart(quasiLeadingComment),
      )
    ) {
      space = softline;
    } else {
      space = " ";
    }
  }

  return label(quasiDoc.label && { tagged: true, ...quasiDoc.label }, [
    print("tag"),
    print("typeArguments"),
    space,
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
  const headerNames = node.quasis[0].value.raw.trim().split(/\s*\|\s*/u);
  if (
    headerNames.length > 1 ||
    headerNames.some((headerName) => headerName.length > 0)
  ) {
    options.__inJestEach = true;
    const expressions = printTemplateExpressions(path, options, print);
    options.__inJestEach = false;
    const stringifiedExpressions = expressions.map(
      (doc) =>
        printDocToString(doc, {
          ...options,
          printWidth: Number.POSITIVE_INFINITY,
          endOfLine: "lf",
        }).formatted,
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

    return [
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
    ];
  }
}

const templateLiteralIndentCache = new WeakMap();
function getTemplateLiteralExpressionIndent(path, options) {
  const { parent: templateLiteral, index } = path;
  if (!templateLiteralIndentCache.has(templateLiteral)) {
    const { tabWidth } = options;
    let previousQuasiIndentSize = 0;
    const sizes = templateLiteral.quasis.map((quasi) => {
      const text = quasi.value.raw;
      const indentSize = text.includes("\n")
        ? getIndentSize(text, tabWidth)
        : previousQuasiIndentSize;
      previousQuasiIndentSize = indentSize;
      return { indentSize, previousQuasiText: text };
    });
    templateLiteralIndentCache.set(templateLiteral, sizes);
  }

  return templateLiteralIndentCache.get(templateLiteral)[index];
}

/*
- `TemplateLiteral`
- `TSTemplateLiteralType` (TypeScript)
*/
function printTemplateExpression(path, options, print) {
  const { node, index } = path;
  let expressionDoc = print();

  const templateLiteral = path.parent;
  const { quasis } = templateLiteral;
  const start = locEnd(quasis[index]);
  const end = locStart(quasis[index + 1]);

  let interpolationHasNewline = hasNewlineInRange(
    options.originalText,
    start,
    end,
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
    (hasComment(node) ||
      node.type === "Identifier" ||
      isMemberExpression(node) ||
      node.type === "ConditionalExpression" ||
      node.type === "SequenceExpression" ||
      isBinaryCastExpression(node) ||
      isBinaryish(node))
  ) {
    expressionDoc = [indent([softline, expressionDoc]), softline];
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
  let { indentSize, previousQuasiText } = getTemplateLiteralExpressionIndent(
    path,
    options,
  );
  // In `jest.each`, we know expression will at least indent 2 level
  if (options.__inJestEach) {
    indentSize = Math.max(indentSize, options.tabWidth);
  }
  expressionDoc =
    indentSize === 0 && previousQuasiText.endsWith("\n")
      ? align(Number.NEGATIVE_INFINITY, expressionDoc)
      : addAlignmentToDoc(expressionDoc, indentSize, options.tabWidth);

  return group(["${", expressionDoc, lineSuffixBoundary, "}"]);
}

function printTemplateExpressions(path, options, print) {
  return path.map(
    () => printTemplateExpression(path, options, print),
    path.node.type === "TSTemplateLiteralType" ? "types" : "expressions",
  );
}

function escapeTemplateCharacters(doc, raw) {
  return mapDoc(doc, (currentDoc) => {
    if (typeof currentDoc === "string") {
      return raw
        ? currentDoc.replaceAll(/(\\*)`/gu, "$1$1\\`")
        : uncookTemplateElementValue(currentDoc);
    }

    return currentDoc;
  });
}

function uncookTemplateElementValue(cookedValue) {
  return cookedValue.replaceAll(/([\\`]|\$\{)/gu, String.raw`\$1`);
}

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
const jestEachTriggerRegex = /^[fx]?(?:describe|it|test)$/u;
function isJestEachTemplateLiteral({ node, parent }) {
  return (
    node.type === "TemplateLiteral" &&
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
  printTaggedTemplateExpression,
  printTemplateExpressions,
  printTemplateLiteral,
  uncookTemplateElementValue,
};
