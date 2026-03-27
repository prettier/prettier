import { locEnd, locStart } from "../../location/index.js";
import {
  isBlockComment,
  isLineComment,
} from "../../utilities/comment-types.js";
import isIndentableBlockComment, {
  indentableLines,
} from "../../utilities/is-indentable-block-comment.js";

function mergeNestledJsdocComments(comments) {
  if (comments.length < 2) {
    return;
  }

  let followingComment;
  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i];

    if (
      followingComment &&
      locEnd(comment) === locStart(followingComment) &&
      isIndentableBlockComment(comment) &&
      isIndentableBlockComment(followingComment)
    ) {
      comments.splice(i + 1, 1);
      comment.value += "*//*" + followingComment.value;
      comment.range = [locStart(comment), locEnd(followingComment)];

      // updating indentableLinesCache
      const commentLines = indentableLines(comment);
      const followingCommentLines = indentableLines(followingComment);
      commentLines.push(
        `${commentLines.pop()}//${followingCommentLines.shift()}`,
        ...followingCommentLines,
      );
    }

    /* c8 ignore next 3 */
    if (!isLineComment(comment) && !isBlockComment(comment)) {
      throw new TypeError(`Unknown comment type: "${comment.type}".`);
    }

    followingComment = comment;
  }
}

export { mergeNestledJsdocComments };
