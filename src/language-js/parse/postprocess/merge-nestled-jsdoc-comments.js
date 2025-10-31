import { locEnd, locStart } from "../../loc.js";
import isBlockComment from "../../utils/is-block-comment.js";
import isIndentableBlockComment from "../../utils/is-indentable-block-comment.js";
import isLineComment from "../../utils/is-line-comment.js";

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
    }

    /* c8 ignore next 3 */
    if (!isLineComment(comment) && !isBlockComment(comment)) {
      throw new TypeError(`Unknown comment type: "${comment.type}".`);
    }

    followingComment = comment;
  }
}

export default mergeNestledJsdocComments;
