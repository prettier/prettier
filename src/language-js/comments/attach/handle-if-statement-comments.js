import {
  addDanglingComment,
  addLeadingComment,
  addTrailingComment,
} from "../../../main/comments/utilities.js";
import getNextNonSpaceNonCommentCharacter from "../../../utilities/get-next-non-space-non-comment-character.js";
import getNextNonSpaceNonCommentCharacterIndex from "../../../utilities/get-next-non-space-non-comment-character-index.js";
import hasNewlineInRange from "../../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../../loc.js";
import { stripComments } from "../../utilities/strip-comments.js";
import { addBlockOrNotComment, isSingleLineComment } from "./utilities.js";

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
  if (
    followingNode.type === "BlockStatement" &&
    followingNode === enclosingNode.consequent &&
    locStart(comment) >= locEnd(precedingNode) &&
    locEnd(comment) <= locStart(followingNode)
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  // Comments before `else`:
  // - treat as trailing comments of the consequent, if it's a BlockStatement
  // - treat as a dangling comment otherwise
  if (
    precedingNode === enclosingNode.consequent &&
    followingNode === enclosingNode.alternate
  ) {
    const start = locStart(enclosingNode);
    const end = locEnd(enclosingNode);
    const ifStatementTxt = stripComments(options).slice(start, end);
    let elseTokenIndex = getNextNonSpaceNonCommentCharacterIndex(
      ifStatementTxt,
      locEnd(enclosingNode.consequent) - start,
    );

    if (elseTokenIndex !== false && ifStatementTxt[elseTokenIndex] === ";") {
      elseTokenIndex = getNextNonSpaceNonCommentCharacterIndex(
        ifStatementTxt,
        elseTokenIndex + 1,
      );
    }
    const isElseToken =
      elseTokenIndex !== false &&
      ifStatementTxt.slice(elseTokenIndex, elseTokenIndex + 4) === "else";

    if (!isElseToken) {
      addTrailingComment(precedingNode, comment);
      return true;
    }

    elseTokenIndex += start;

    // if comment is positioned between the `else` token and its body
    if (
      followingNode.type === "BlockStatement" &&
      locStart(comment) >= elseTokenIndex &&
      locEnd(comment) <= locStart(followingNode)
    ) {
      addLeadingComment(followingNode, comment);
      return true;
    }

    // With the above conditions alone, this code would also match. This is a false positive.
    // So, ignore cases where the token "else" appears immediately after the consequent:
    //
    //   if (cond) a;
    //   else /* foo */ b;
    if (
      locStart(comment) < elseTokenIndex ||
      enclosingNode.alternate.type === "BlockStatement"
    ) {
      if (precedingNode.type === "BlockStatement") {
        addTrailingComment(precedingNode, comment);
        return true;
      }

      if (
        isSingleLineComment(comment, text) &&
        // Comment and `precedingNode` are on same line
        !hasNewlineInRange(text, locStart(precedingNode), locStart(comment))
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
  }

  // For comments positioned after the condition parenthesis in an if statement
  // before the consequent without brackets on, such as
  // if (a) /* comment */ true,
  // we look at the next character to see if the following node
  // is the consequent for the if statement
  if (enclosingNode.consequent === followingNode) {
    addBlockOrNotComment(followingNode, comment);
    return true;
  }

  return false;
}

export { handleIfStatementComments };
