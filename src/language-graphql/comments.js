import {
  addLeadingComment,
  addTrailingComment,
} from "../main/comments/utils.js";

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

  if (precedingNode && precedingNode.kind === "VariableDefinition") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

function endOfLine(comment /*, text, options, ast, isLastComment **/) {
  const { enclosingNode, followingNode, precedingNode } = comment;
  if (enclosingNode && enclosingNode.kind === "Field") {
    if (followingNode && followingNode.kind === "FieldDefinition") {
      addLeadingComment(followingNode, comment);
      return true;
    }
    if (followingNode && followingNode.kind === "SelectionSet") {
      addLeadingComment(followingNode, comment);
      return true;
    }
  }

  if (precedingNode && precedingNode.kind === "FieldDefinition") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

export const handleComments = {
  ownLine,
  endOfLine,
};
