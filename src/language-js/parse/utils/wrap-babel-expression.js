/**
 * @param {{
 *   text: string,
 *   type?: string,
 *   rootMarker?: string,
 * }} options
 */
function wrapBabelExpression(expression, options) {
  const { type = "JsExpressionRoot", rootMarker, text } = options;

  const { tokens, comments } = expression;
  delete expression.tokens;
  delete expression.comments;

  return {
    tokens,
    comments,
    type,
    node: expression,
    range: [0, text.length],
    rootMarker,
  };
}

export default wrapBabelExpression;
