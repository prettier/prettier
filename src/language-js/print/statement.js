import { hardline } from "../../document/builders.js";
import pathNeedsParens from "../needs-parens.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
  isJsxNode,
  isTheOnlyJsxElementInMarkdown,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
} from "../utils/index.js";
import { shouldPrintParamsWithoutParens } from "./function.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 * @typedef {import("../../common/ast-path.js")} AstPath
 */

function printStatementSequence(path, options, print) {
  const { node } = path;
  const parts = [];
  const property = node.type === "SwitchCase" ? "consequent" : "body";
  const lastStatement = getLastStatement(node[property]);

  path.each(({ node }) => {
    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (node.type === "EmptyStatement") {
      return;
    }

    const printed = print();

    // in no-semi mode, prepend statement with semicolon if it might break ASI
    // don't prepend the only JSX element in a program with semicolon
    if (
      !options.semi &&
      !isTheOnlyJsxElementInMarkdown(options, path) &&
      statementNeedsASIProtection(path, options)
    ) {
      if (hasComment(node, CommentCheckFlags.Leading)) {
        parts.push(print([], { needsSemi: true }));
      } else {
        parts.push(";", printed);
      }
    } else {
      parts.push(printed);
    }

    if (node !== lastStatement) {
      parts.push(hardline);

      if (isNextLineEmpty(node, options)) {
        parts.push(hardline);
      }
    }
  }, property);

  return parts;
}

function getLastStatement(statements) {
  for (let i = statements.length - 1; i >= 0; i--) {
    const statement = statements[i];
    if (statement.type !== "EmptyStatement") {
      return statement;
    }
  }
}

function statementNeedsASIProtection(path, options) {
  const { node } = path;

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return path.call(
    (childPath) => expressionNeedsASIProtection(childPath, options),
    "expression"
  );
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
      if (isJsxNode(node)) {
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

export { printStatementSequence };
