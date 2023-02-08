import pathNeedsParens from "../needs-parens.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
  isJsxElement,
  isTheOnlyJsxElementInMarkdown,
} from "../utils/index.js";
import { shouldPrintParamsWithoutParens } from "./function.js";

function shouldPrintLeadingSemicolon(path, options) {
  if (options.semi || isTheOnlyJsxElementInMarkdown(options, path)) {
    return false;
  }

  const { node } = path;
  if (
    node.type === "ExpressionStatement" &&
    [
      (node, key) =>
        key === "body" &&
        (node.type === "Program" ||
          node.type === "BlockStatement" ||
          node.type === "StaticBlock" ||
          node.type === "TSModuleBlock"),
      (node, key) => key === "consequent" && node.type === "SwitchCase",
    ].some((predicate) => path.match(undefined, predicate)) &&
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
    ...getLeftSidePathName(node)
  );
}

export { shouldPrintLeadingSemicolon };
