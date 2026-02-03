import {
  addDanglingComment,
  addLeadingComment,
  addTrailingComment,
} from "../../../main/comments/utilities.js";
import getNextNonSpaceNonCommentCharacter from "../../../utilities/get-next-non-space-non-comment-character.js";
import hasNewlineInRange from "../../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../../location/index.js";
import { stripComments } from "../../utilities/strip-comments.js";
import { isSingleLineComment } from "./utilities.js";

// There are often comments before the else clause of if statements like
//
//   if (1) { ... }
//   // comment
//   else { ... }
//
// They are being attached as leading comments of the BlockExpression which
// is not well printed. What we want is to instead move the comment inside
// of the block and make it leadingComment of the first element of the block
// or dangling comment of the block if there is nothing inside
//
//   if (1) { ... }
//   else {
//     // comment
//     ...
//   }
function handleIfStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
  options,
}) {
  if (enclosingNode?.type !== "IfStatement" || !followingNode) {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   if (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    locEnd(comment),
  );
  if (nextCharacter === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // if comment is positioned between the condition and its body
  if (followingNode === enclosingNode.consequent) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  if (
    precedingNode === enclosingNode.consequent &&
    followingNode === enclosingNode.alternate
  ) {
    return handleCommentsBetween({
      comment,
      precedingNode,
      enclosingNode,
      followingNode,
      text,
      options,
    });
  }

  return false;
}

function handleCommentsBetween({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
  options,
}) {
  const elseTokenIndex = stripComments(options).indexOf(
    "else",
    locEnd(enclosingNode.consequent),
  );

  // if comment is positioned after the `else` token
  if (locStart(comment) >= elseTokenIndex) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  const isConsequentBlockStatement = precedingNode.type === "BlockStatement";

  // Comments before `else`:
  // - treat as trailing comments of the consequent, if it's a BlockStatement
  // - treat as a dangling comment otherwise
  if (
    !isConsequentBlockStatement &&
    isSingleLineComment &&
    // Comment and `precedingNode` are on same line
    !hasNewlineInRange(text, locEnd(precedingNode), locStart(comment))
  ) {
    // example:
    //   if (cond1) expr1; // comment A
    //   else if (cond2) expr2; // comment A
    //   else expr3;

    addTrailingComment(precedingNode, comment);
    return true;
  }

  addDanglingComment(enclosingNode, comment);
  return true;
}

export { handleIfStatementComments };
