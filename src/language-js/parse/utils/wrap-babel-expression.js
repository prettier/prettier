function wrapBabelExpression(node, options, type = "JsExpressionRoot") {
  const { tokens, comments } = node;
  delete node.tokens;
  delete node.comments;

  return {
    tokens,
    comments,
    type,
    node,
    range: [0, options.originalText.length],
    rootMarker: options.rootMarker,
  };
}

export default wrapBabelExpression;
