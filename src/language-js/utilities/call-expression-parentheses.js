import { locEnd, locStart } from "../loc.js";
import getTextWithoutComments from "../utilities/get-text-without-comments.js";

function getCallOrNewExpressionClosingParenthesisIndex(
  callExpression,
  options,
) {
  const closingParenthesisIndex = locEnd(callExpression) - 1;

  /* c8 ignore next 6 */
  if (options.originalText[closingParenthesisIndex] !== ")") {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `Unable to get '${callExpression.type}' closing parenthesis.`,
      );
    }
    return;
  }

  return closingParenthesisIndex;
}

function getCallOrNewExpressionOpeningParenthesisIndex(
  callExpression,
  options,
) {
  const closingParenthesisIndex = getCallOrNewExpressionClosingParenthesisIndex(
    callExpression,
    options,
  );

  /* c8 ignore next 3 */
  if (closingParenthesisIndex === undefined) {
    return;
  }

  const start = locEnd(callExpression.typeArguments ?? callExpression.callee);
  const text = getTextWithoutComments(options, start, closingParenthesisIndex);
  const openingParenthesisIndex = text.indexOf("(");

  /* c8 ignore next 6 */
  if (openingParenthesisIndex === -1) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `Unable to get '${callExpression.type}' opening parenthesis.`,
      );
    }
    return;
  }

  return start + openingParenthesisIndex;
}

function isInsideCallOrNewExpressionParentheses(
  callExpression,
  nodeOrComment,
  options,
) {
  const closingParenthesisIndex = getCallOrNewExpressionClosingParenthesisIndex(
    callExpression,
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
    callExpression,
    options,
  );

  /* c8 ignore next 3 */
  if (openingParenthesisIndex === undefined) {
    return false;
  }

  return locStart(nodeOrComment) > openingParenthesisIndex;
}

export { isInsideCallOrNewExpressionParentheses };
