import { inheritLabel } from "../../document/index.js";
import {
  printComments,
  printLeadingComments,
} from "../../main/comments/print.js";
import { locStart } from "../location/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintParamsWithoutParens } from "../print/function.js";
import { CommentCheckFlags, getComments } from "../utilities/comments.js";
import isIgnored from "../utilities/is-ignored.js";
import { isIifeCalleeOrTaggedTemplateExpressionTag } from "../utilities/is-iife-callee-or-tagged-template-expression-tag.js";
import { isTypeCastComment } from "../utilities/is-type-cast-comment.js";
import {
  getLeftSide,
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
import { isJsxElement } from "../utilities/node-types.js";

/** @import {Doc} from "../../document/index.js" */

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

function getTrailingTypeCastComment(node) {
  const lastComment = getComments(node, CommentCheckFlags.Leading).at(-1);
  return lastComment && isTypeCastComment(lastComment)
    ? lastComment
    : undefined;
}

function getLeftmostChild(node) {
  if (!hasNakedLeftSide(node)) {
    return;
  }

  return node.type === "BindExpression" ? node.object : getLeftSide(node);
}

function stopsLeadingSemicolon(path, options) {
  const { node } = path;
  return (
    !getLeftmostChild(node) ||
    isIgnored(path) ||
    isIifeCalleeOrTaggedTemplateExpressionTag(path) ||
    isJsxElement(node) ||
    needsParentheses(path, options)
  );
}

function shouldDescendantPrintLeadingSemicolon(path, options) {
  const { node, parent, key } = path;
  if (!parent) {
    return false;
  }

  if (parent.type === "ExpressionStatement") {
    return (
      key === "expression" &&
      path.callParent(
        () =>
          !isIgnored(path) &&
          shouldExpressionStatementPrintLeadingSemicolon(path, options) &&
          !getTrailingTypeCastComment(path.node),
      )
    );
  }

  if (getLeftmostChild(parent) !== node) {
    return false;
  }

  return path.callParent(() => {
    if (stopsLeadingSemicolon(path, options)) {
      return false;
    }
    return shouldDescendantPrintLeadingSemicolon(path, options);
  });
}

function shouldPrintLeadingSemicolon(path, options) {
  if (options.semi) {
    return false;
  }

  const { node } = path;
  if (node.type === "ExpressionStatement") {
    return (
      !isIgnored(path) &&
      shouldExpressionStatementPrintLeadingSemicolon(path, options) &&
      Boolean(getTrailingTypeCastComment(node))
    );
  }

  return (
    stopsLeadingSemicolon(path, options) &&
    shouldDescendantPrintLeadingSemicolon(path, options)
  );
}

/**
@param {import("../../common/ast-path.js").default} path
@param {Doc} doc
@param {any} options
@param {{ semicolon?: Doc, printOwnComments?: boolean }} [printOptions]
@returns {Doc}
*/
function printWithLeadingSemicolon(
  path,
  doc,
  options,
  { semicolon = ";", printOwnComments = false } = {},
) {
  const typeCastComment = getTrailingTypeCastComment(path.node);
  if (typeCastComment) {
    // Print the type cast comment separately and print `;` before it
    const typeCastCommentDoc = printLeadingComments(path, options, {
      filter: (comment) => comment === typeCastComment,
    });

    return printComments(path, [semicolon, typeCastCommentDoc, doc], options, {
      filter: (comment) => comment !== typeCastComment,
    });
  }

  if (printOwnComments) {
    return printComments(path, [semicolon, doc], options);
  }

  return inheritLabel(doc, (doc) => [semicolon, doc]);
}

export {
  getTrailingTypeCastComment,
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  printWithLeadingSemicolon,
  shouldExpressionStatementPrintLeadingSemicolon,
  shouldIgnoredExpressionStatementPrintLeadingSemicolon,
  shouldPrintLeadingSemicolon,
};
