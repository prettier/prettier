import { locEnd, locStart } from "../location/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintParamsWithoutParens } from "../print/function.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
import { isJsxElement } from "../utilities/node-types.js";

function shouldExpressionStatementPrintLeadingSemicolon(path, options) {
  if (
    options.semi &&
    !isExpressionStatementAfterMultilineShebangShellShim(path, options)
  ) {
    return false;
  }

  const { node } = path;

  if (
    node.type !== "ExpressionStatement" ||
    isSingleJsxExpressionStatementInMarkdown(path, options) ||
    isSingleVueEventBindingExpressionStatement(path, options) ||
    isSingleHtmlEventHandlerExpressionStatement(path, options)
  ) {
    return false;
  }

  const { key, parent } = path;
  if (
    // `Program.directives` don't need leading semicolon
    ((key === "body" &&
      (parent.type === "Program" ||
        parent.type === "BlockStatement" ||
        parent.type === "StaticBlock" ||
        parent.type === "TSModuleBlock")) ||
      (key === "consequent" && parent.type === "SwitchCase")) &&
    path.call(() => expressionNeedsAsiProtection(path, options), "expression")
  ) {
    return true;
  }

  return false;
}

function isMultilineShebangShellShim(path, options) {
  const { node, parent } = path;

  if (
    parent?.type !== "Program" ||
    !options.originalText.startsWith("#!") ||
    !isColonDirectiveLikeNode(node)
  ) {
    return false;
  }

  const firstLineEnd = options.originalText.indexOf("\n");
  if (firstLineEnd === -1 || locStart(node) !== firstLineEnd + 1) {
    return false;
  }

  const contentEnd = node.__contentEnd ?? locEnd(node.value ?? node.expression);
  const endOfLine = options.originalText.indexOf("\n", contentEnd);
  const lineRest = options.originalText.slice(
    contentEnd,
    endOfLine === -1 ? undefined : endOfLine,
  );

  return /^\s*\/\/\s*;/.test(lineRest);
}

function isColonDirectiveLikeNode(node) {
  return (
    (node.type === "Directive" && node.value?.value === ":") ||
    (node.type === "ExpressionStatement" &&
      node.directive === ":" &&
      node.expression.value === ":")
  );
}

function isExpressionStatementAfterMultilineShebangShellShim(path, options) {
  if (
    path.node.type !== "ExpressionStatement" ||
    path.parent?.type !== "Program"
  ) {
    return false;
  }

  const previousStatement = path.previous;
  if (previousStatement) {
    return isMultilineShebangShellShim(
      { node: previousStatement, parent: path.parent },
      options,
    );
  }

  const previousDirective = path.parent.directives?.at(-1);
  return (
    previousDirective &&
    isMultilineShebangShellShim(
      { node: previousDirective, parent: path.parent },
      options,
    )
  );
}

function expressionNeedsAsiProtection(path, options) {
  const { node } = path;
  switch (node.type) {
    case "ParenthesizedExpression":
    case "TypeCastExpression":
    case "TSTypeAssertion":
    case "ArrayExpression":
    case "ArrayPattern":
    case "TemplateLiteral":
    case "TemplateElement":
    case "RegExpLiteral":
      return true;

    case "ArrowFunctionExpression":
      if (!shouldPrintParamsWithoutParens(path, options)) {
        return true;
      }
      break;

    case "UnaryExpression": {
      const { prefix, operator } = node;
      if (prefix && (operator === "+" || operator === "-")) {
        return true;
      }
      break;
    }
    case "BindExpression":
      if (!node.object) {
        return true;
      }
      break;

    case "Literal":
      if (node.regex) {
        return true;
      }
      break;

    default:
      if (isJsxElement(node)) {
        return true;
      }
  }

  if (needsParentheses(path, options)) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call(
    () => expressionNeedsAsiProtection(path, options),
    ...getLeftSidePathName(node),
  );
}

const isSingleExpressionStatement = ({ node, parent }) =>
  node.type === "ExpressionStatement" &&
  parent.type === "Program" &&
  parent.body.length === 1 &&
  // In non-Babel parser, directives are `ExpressionStatement`s
  ((Array.isArray(parent.directives) && parent.directives.length === 0) ||
    !parent.directives);

function isSingleJsxExpressionStatementInMarkdown(path, options) {
  return (
    (options.parentParser === "markdown" || options.parentParser === "mdx") &&
    isSingleExpressionStatement(path) &&
    isJsxElement(path.node.expression)
  );
}

function isSingleHtmlEventHandlerExpressionStatement(path, options) {
  return (
    options.__isHtmlInlineEventHandler && isSingleExpressionStatement(path)
  );
}

function isSingleVueEventBindingExpressionStatement(path, options) {
  return (
    (options.parser === "__vue_event_binding" ||
      options.parser === "__vue_ts_event_binding") &&
    isSingleExpressionStatement(path)
  );
}

export {
  isMultilineShebangShellShim,
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
};
