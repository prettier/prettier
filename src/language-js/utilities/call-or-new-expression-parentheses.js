import { locEnd, locStart } from "../loc.js";
import getTextWithoutComments from "./get-text-without-comments.js";

/**
@import {Node, Comment, NodeMap} from "../types/estree.js"
@typedef {
  | NodeMap["CallExpression"]
  | NodeMap["OptionalCallExpression"]
  | NodeMap["NewExpression"]
} CallOrNewExpression
@typedef {Node | Comment} NodeOrComment
*/

/**
@param {CallOrNewExpression} callOrNewExpression
@returns {number | undefined}
*/
function getCallOrNewExpressionClosingParenthesisIndex(
  callOrNewExpression,
  options,
) {
  const closingParenthesisIndex = locEnd(callOrNewExpression) - 1;

  /* c8 ignore next 6 */
  if (options.originalText[closingParenthesisIndex] !== ")") {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `Unable to get '${callOrNewExpression.type}' closing parenthesis.`,
      );
    }
    return;
  }

  return closingParenthesisIndex;
}

/**
@param {CallOrNewExpression} callOrNewExpression
@returns {number | void}
*/
function getCallOrNewExpressionOpeningParenthesisIndex(
  callOrNewExpression,
  options,
) {
  const closingParenthesisIndex = getCallOrNewExpressionClosingParenthesisIndex(
    callOrNewExpression,
    options,
  );

  /* c8 ignore next 3 */
  if (closingParenthesisIndex === undefined) {
    return;
  }

  const start = locEnd(
    callOrNewExpression.typeArguments ?? callOrNewExpression.callee,
  );
  const text = getTextWithoutComments(options, start, closingParenthesisIndex);
  const openingParenthesisIndex = text.indexOf("(");

  /* c8 ignore next 6 */
  if (openingParenthesisIndex === -1) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `Unable to get '${callOrNewExpression.type}' opening parenthesis.`,
      );
    }
    return;
  }

  return start + openingParenthesisIndex;
}

/**
@param {CallOrNewExpression} callOrNewExpression
@param {NodeOrComment} nodeOrComment
@returns {boolean}
*/
function isInsideCallOrNewExpressionParentheses(
  callOrNewExpression,
  nodeOrComment,
  options,
) {
  const closingParenthesisIndex = getCallOrNewExpressionClosingParenthesisIndex(
    callOrNewExpression,
    options,
  );

  /* c8 ignore next 3 */
  if (closingParenthesisIndex === undefined) {
    return false;
  }

  if (locEnd(nodeOrComment) > closingParenthesisIndex) {
    return false;
  }

  const openingParenthesisIndex = getCallOrNewExpressionOpeningParenthesisIndex(
    callOrNewExpression,
    options,
  );

  /* c8 ignore next 3 */
  if (openingParenthesisIndex === undefined) {
    return false;
  }

  return locStart(nodeOrComment) > openingParenthesisIndex;
}

export { isInsideCallOrNewExpressionParentheses };
