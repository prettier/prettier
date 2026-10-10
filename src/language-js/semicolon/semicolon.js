import { locStart } from "../location/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintParamsWithoutParens } from "../print/function.js";
import { hasNodeIgnoreComment } from "../utilities/has-node-ignore-comment.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
import { isJsxElement } from "../utilities/node-types.js";

function shouldExpressionStatementPrintLeadingSemicolon(path, options) {
  if (options.semi) {
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
  // A leading semicolon is only safe for items in a statement list.
  const isStatementListItem =
    (key === "body" &&
      (parent.type === "Program" ||
        parent.type === "BlockStatement" ||
        parent.type === "StaticBlock" ||
        parent.type === "TSModuleBlock")) ||
    (key === "consequent" && parent.type === "SwitchCase");

  if (
    isStatementListItem &&
    (path.call(
      () => expressionNeedsAsiProtection(path, options),
      "expression",
    ) ||
      // typescript-estree removes ParenthesizedExpression nodes, so an ignored
      // expression that starts with `(` needs a source-text fallback.
      (hasNodeIgnoreComment(node) &&
        options.originalText[locStart(node)] === "("))
  ) {
    return true;
  }

  return false;
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
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
};
