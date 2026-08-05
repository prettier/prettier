import { locEnd } from "../location/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintParamsWithoutParens } from "../print/function.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
import { isJsxElement } from "../utilities/node-types.js";

const SHELL_SHEBANG_RE = /^#!.*\b(?:sh|bash|dash|ash|zsh|fish|ksh)\b/;

function getFirstLine(originalText) {
  const lineEnd = originalText.indexOf("\n");
  return lineEnd === -1 ? originalText : originalText.slice(0, lineEnd);
}

function isShellShebang(options) {
  return (
    options.originalText.startsWith("#!") &&
    SHELL_SHEBANG_RE.test(getFirstLine(options.originalText))
  );
}

function isColonDirectiveLikeNode(node) {
  return (
    (node.type === "Directive" && node.value?.value === ":") ||
    (node.type === "ExpressionStatement" &&
      (node.directive === ":" || node.expression?.value === ":"))
  );
}

function isFirstProgramNode(node, parent) {
  return (
    parent.type === "Program" &&
    (parent.directives?.[0] === node || parent.body?.[0] === node)
  );
}

function hasShellTrampolineComment(node, options) {
  const contentNode = node.value ?? node.expression;
  if (!contentNode) {
    return false;
  }

  const contentEnd = locEnd(contentNode);
  const lineEnd = options.originalText.indexOf("\n", contentEnd);
  const lineRest =
    lineEnd === -1
      ? options.originalText.slice(contentEnd)
      : options.originalText.slice(contentEnd, lineEnd);

  return /^\s*\/\/\s*;/.test(lineRest);
}

function isShellShebangDirective(path, options) {
  const { node, parent } = path;

  return (
    isShellShebang(options) &&
    isFirstProgramNode(node, parent) &&
    isColonDirectiveLikeNode(node) &&
    hasShellTrampolineComment(node, options)
  );
}

function isAfterShellShebangDirective(path, options) {
  const { node, parent } = path;

  if (
    node.type !== "ExpressionStatement" ||
    parent?.type !== "Program" ||
    path.key !== "body"
  ) {
    return false;
  }

  const previousNode =
    path.index === 0 ? parent.directives?.at(-1) : parent.body[path.index - 1];

  return (
    previousNode &&
    isShellShebangDirective({ node: previousNode, parent }, options)
  );
}

function shouldExpressionStatementPrintLeadingSemicolon(path, options) {
  if (options.semi && !isAfterShellShebangDirective(path, options)) {
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
  isAfterShellShebangDirective,
  isShellShebangDirective,
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
};
