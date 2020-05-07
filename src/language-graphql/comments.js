"use strict";
const { addTrailingComment } = require("../common/util-shared");

function ownLine(comment /*, text, options, ast, isLastComment*/) {
  const { precedingNode, enclosingNode } = comment;
  if (
    enclosingNode &&
    precedingNode &&
    enclosingNode.kind === "ObjectTypeDefinition" &&
    enclosingNode.description === precedingNode
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

module.exports = {
  ownLine,
};
