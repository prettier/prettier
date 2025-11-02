import pathNeedsParens from "../needs-parens.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
  isJsxElement,
} from "../utils/index.js";
import { shouldPrintParamsWithoutParens } from "./function.js";

function shouldPrintLeadingSemicolon(path, options) {
  if (
    options.semi ||
    isSingleJsxExpressionStatementInMarkdown(path, options) ||
    isSingleVueEventBindingExpressionStatement(path, options) ||
    isSingleHtmlEventHandlerExpressionStatement(path, options)
  ) {
    return false;
  }

  const { node, key, parent } = path;
  if (
    node.type === "ExpressionStatement" &&
    // `Program.directives` don't need leading semicolon
    ((key === "body" &&
      (parent.type === "Program" ||
        parent.type === "BlockStatement" ||
        parent.type === "StaticBlock" ||
        parent.type === "TSModuleBlock")) ||
      (key === "consequent" && parent.type === "SwitchCase")) &&
    path.call(() => expressionNeedsASIProtection(path, options), "expression")
  ) {
    return true;
  }

  return false;
}

function expressionNeedsASIProtection(path, options) {
  const { node } = path;
  switch (node.type) {
    case "ParenthesizedExpression":
    case "TypeCastExpression":
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

  if (pathNeedsParens(path, options)) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call(
    () => expressionNeedsASIProtection(path, options),
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
  shouldPrintLeadingSemicolon,
};
