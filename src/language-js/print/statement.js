"use strict";

const { isNextLineEmpty } = require("../../common/util");
const {
  builders: { concat, join, hardline },
} = require("../../document");
const pathNeedsParens = require("../needs-parens");
const {
  classChildNeedsASIProtection,
  classPropMayCauseASIProblems,
  getLeftSidePathName,
  hasNakedLeftSide,
  isJsxNode,
  isTheOnlyJsxElementInMarkdown,
  hasComment,
  CommentCheckFlags,
} = require("../utils");
const { locEnd } = require("../loc");
const { shouldPrintParamsWithoutParens } = require("./function");

/**
 * @typedef {import("../../document").Doc} Doc
 * @typedef {import("../../common/fast-path")} FastPath
 */

function printStatement(path, options, print, index) {
  const node = path.getValue();

  // Just in case the AST has been modified to contain falsy
  // "statements," it's safer simply to skip them.
  /* istanbul ignore if */
  if (!node) {
    return;
  }

  // Skip printing EmptyStatement nodes to avoid leaving stray
  // semicolons lying around.
  if (node.type === "EmptyStatement") {
    return;
  }

  const parent = path.parentNode();
  const isClassBody = parent.type === "ClassBody";

  const printed = print(path);
  const text = options.originalText;
  const parts = [];

  // in no-semi mode, prepend statement with semicolon if it might break ASI
  // don't prepend the only JSX element in a program with semicolon
  if (
    !options.semi &&
    !isClassBody &&
    !isTheOnlyJsxElementInMarkdown(options, path) &&
    statementNeedsASIProtection(path, options)
  ) {
    if (hasComment(node, CommentCheckFlags.Leading)) {
      parts.push(print(path, { needsSemi: true }));
    } else {
      parts.push(";", printed);
    }
  } else {
    parts.push(printed);
  }

  if (!options.semi && isClassBody) {
    if (classPropMayCauseASIProblems(path)) {
      parts.push(";");
    } else if (
      node.type === "ClassProperty" ||
      node.type === "FieldDefinition"
    ) {
      const nextChild = parent.body[index + 1];
      if (classChildNeedsASIProtection(nextChild)) {
        parts.push(";");
      }
    }
  }

  if (isNextLineEmpty(text, node, locEnd) && !isLastStatement(path)) {
    parts.push(hardline);
  }

  return concat(parts);
}

function printStatementSequence(path, options, print, property) {
  const printed = path
    .map((path, index) => printStatement(path, options, print, index), property)
    .filter(Boolean);

  return join(hardline, printed);
}

function statementNeedsASIProtection(path, options) {
  const node = path.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return path.call(
    (childPath) => expressionNeedsASIProtection(childPath, options),
    "expression"
  );
}

function expressionNeedsASIProtection(path, options) {
  const node = path.getValue();

  const maybeASIProblem =
    pathNeedsParens(path, options) ||
    node.type === "ParenthesizedExpression" ||
    node.type === "TypeCastExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      !shouldPrintParamsWithoutParens(path, options)) ||
    node.type === "ArrayExpression" ||
    node.type === "ArrayPattern" ||
    (node.type === "UnaryExpression" &&
      node.prefix &&
      (node.operator === "+" || node.operator === "-")) ||
    node.type === "TemplateLiteral" ||
    node.type === "TemplateElement" ||
    isJsxNode(node) ||
    (node.type === "BindExpression" && !node.object) ||
    node.type === "RegExpLiteral" ||
    (node.type === "Literal" && node.pattern) ||
    (node.type === "Literal" && node.regex);

  if (maybeASIProblem) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call(
    (childPath) => expressionNeedsASIProtection(childPath, options),
    ...getLeftSidePathName(path, node)
  );
}

function printBody(path, options, print) {
  return printStatementSequence(path, options, print, "body");
}

function printSwitchCaseConsequent(path, options, print) {
  return printStatementSequence(path, options, print, "consequent");
}

/**
 * @param {FastPath} path
 * @returns {boolean}
 */
function isLastStatement(path) {
  const parent = path.getParentNode();
  const node = path.getValue();
  const body = (parent.body || parent.consequent).filter(
    (stmt) => stmt.type !== "EmptyStatement"
  );
  return body[body.length - 1] === node;
}

module.exports = {
  printBody,
  printSwitchCaseConsequent,
};
