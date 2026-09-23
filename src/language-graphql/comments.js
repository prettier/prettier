import {
  addLeadingComment,
  addTrailingComment,
} from "../main/comments/utilities.js";
import { locEnd } from "./loc.js";

/**
 * The shared `getNextNonSpaceNonCommentCharacter` only knows about `//`
 * comments, so GraphQL needs its own scan. Commas are insignificant in GraphQL,
 * so they are skipped along with whitespace and `#` comments.
 *
 * @param {string} text
 * @param {number} startIndex
 * @returns {string} the next significant character, or `""` at end of input
 */
function getNextNonSpaceNonCommentCharacter(text, startIndex) {
  for (let index = startIndex; index < text.length; index++) {
    const character = text.charAt(index);

    if (character === "#") {
      const newlineIndex = text.indexOf("\n", index);
      if (newlineIndex === -1) {
        return "";
      }
      index = newlineIndex;
      continue;
    }

    if (character === "," || /\s/u.test(character)) {
      continue;
    }

    return character;
  }

  return "";
}

/**
 * A comment at the end of a parenthesized list has no node after it inside the
 * parentheses, so the generic algorithm attaches it as a leading comment of
 * whatever follows the `)`, moving it out of the list. Attach it to the last
 * item of the list instead, so it stays inside the parentheses:
 *
 *     query Browse(
 *       $search: String
 *       # $foo: Int
 *     ) {
 *       t
 *     }
 *
 * @returns {boolean}
 */
function handleCommentAtEndOfParenthesizedList(comment) {
  const { precedingNode } = comment;

  if (
    precedingNode?.kind === "VariableDefinition" ||
    precedingNode?.kind === "Argument"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

/**
 * A comment between a node and the `{` of its selection set is attached to the
 * preceding node, and printed as a line suffix — which lands it after the `{`
 * that gets printed on the same line. Re-parsing then finds the comment inside
 * the braces, so the output only settles after two or three runs.
 *
 * Put the comment inside the selection set right away, which is where the
 * repeated runs end up anyway:
 *
 *     {
 *       a {
 *         # (b: C)
 *         d
 *       }
 *     }
 *
 * @returns {boolean}
 */
function handleCommentBeforeSelectionSet(comment) {
  const { followingNode } = comment;

  if (followingNode?.kind === "SelectionSet") {
    addLeadingComment(followingNode.selections[0], comment);
    return true;
  }

  return false;
}

function handleComment(comment, text) {
  switch (getNextNonSpaceNonCommentCharacter(text, locEnd(comment))) {
    case ")":
      return handleCommentAtEndOfParenthesizedList(comment);
    case "{":
      return handleCommentBeforeSelectionSet(comment);
    default:
      return false;
  }
}

const handleComments = {
  ownLine: handleComment,
  endOfLine: handleComment,
};

export default handleComments;
