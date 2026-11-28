import { locStart } from "../location/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintParamsWithoutParens } from "../print/function.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
import { isJsxElement } from "../utilities/node-types.js";

function isEligibleForLeadingSemicolon(path, options) {
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
  if (
    // `Program.directives` don't need leading semicolon
    (key === "body" &&
      (parent.type === "Program" ||
        parent.type === "BlockStatement" ||
        parent.type === "StaticBlock" ||
        parent.type === "TSModuleBlock")) ||
    (key === "consequent" && parent.type === "SwitchCase")
  ) {
    return true;
  }

  return false;
}

function shouldExpressionStatementPrintLeadingSemicolon(path, options) {
  return (
    isEligibleForLeadingSemicolon(path, options) &&
    path.call(() => expressionNeedsAsiProtection(path, options), "expression")
  );
}

const ASI_HAZARD_START_CHARACTERS = new Set("[(`+-/<:");
/*
`prettier-ignore`d nodes print their original text verbatim, so ASI
protection can't be decided from the AST alone: parentheses that are
redundant (and dropped when formatting normally, eg `(new Widget).run()`)
are invisible to `expressionNeedsAsiProtection`, while the verbatim text
still starts with `(`.
*/
function shouldIgnoredExpressionStatementPrintLeadingSemicolon(path, options) {
  if (!isEligibleForLeadingSemicolon(path, options)) {
    return false;
  }

  const leadingCharacter = options.originalText[locStart(path.node)];
  return ASI_HAZARD_START_CHARACTERS.has(leadingCharacter);
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

function isFollowedByBlockStatement(path) {
  const { stack } = path;
  for (let i = stack.length - 1; i >= 2; i -= 2) {
    const parentOrArray = stack[i - 2];
    const key = stack[i - 1];

    if (Array.isArray(parentOrArray)) {
      const parent = stack[i - 4];
      const prop = stack[i - 3];
      if (
        (prop === "body" &&
          (parent.type === "Program" ||
            parent.type === "BlockStatement" ||
            parent.type === "StaticBlock" ||
            parent.type === "TSModuleBlock")) ||
        (prop === "consequent" && parent.type === "SwitchCase")
      ) {
        for (let j = key + 1; j < parentOrArray.length; j++) {
          const next = parentOrArray[j];
          if (next.type !== "EmptyStatement") {
            return next.type === "BlockStatement";
          }
        }
      }
      return false;
    }

    if (
      (key === "body" &&
        (parentOrArray.type === "ForStatement" ||
          parentOrArray.type === "ForInStatement" ||
          parentOrArray.type === "ForOfStatement" ||
          parentOrArray.type === "WhileStatement" ||
          parentOrArray.type === "WithStatement" ||
          parentOrArray.type === "LabeledStatement")) ||
      (key === "consequent" &&
        parentOrArray.type === "IfStatement" &&
        !parentOrArray.alternate) ||
      (key === "alternate" && parentOrArray.type === "IfStatement") ||
      (key === "declaration" &&
        (parentOrArray.type === "ExportNamedDeclaration" ||
          parentOrArray.type === "ExportDefaultDeclaration"))
    ) {
      continue;
    }

    return false;
  }

  return false;
}

export {
  isFollowedByBlockStatement,
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
  shouldIgnoredExpressionStatementPrintLeadingSemicolon,
};
