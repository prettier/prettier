"use strict";

function hasFlowShorthandAnnotationComment(node) {
  // https://flow.org/en/docs/types/comments/
  // Syntax example: const r = new (window.Request /*: Class<Request> */)("");

  return (
    node.extra &&
    node.extra.parenthesized &&
    node.trailingComments &&
    // We intentionally only match spaces and tabs here instead of any whitespace because
    // Flow annotation comments cannot be split across lines. For example:
    //
    // (this /*
    // : any */).foo = 5;
    //
    // is not picked up by Flow, so removing the newline would create a type annotation
    // that the user did not intend to create.
    node.trailingComments[0].value.match(/^[ \t]*:/)
  );
}

module.exports = {
  hasFlowShorthandAnnotationComment
};
