"use strict";

function hasFlowShorthandAnnotationComment(node) {
  // https://flow.org/en/docs/types/comments/
  // Syntax example: const r = new (window.Request /*: Class<Request> */)("");

  return (
    node.extra &&
    node.extra.parenthesized &&
    node.trailingComments &&
    node.trailingComments[0].value.trimLeft().startsWith(":")
  );
}

module.exports = {
  hasFlowShorthandAnnotationComment
};
