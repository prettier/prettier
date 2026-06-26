import { addLeadingComment } from "../../../main/comments/utilities.js";
import { locEnd, locStart } from "../../location/index.js";
import { isPrettierIgnoreComment } from "../../utilities/is-prettier-ignore-comment.js";
import { isUnionType } from "../../utilities/node-types.js";
import { stripComments } from "../../utilities/strip-comments.js";
import { isSingleLineBlockComment } from "../attach/utilities.js";

function shouldAttachToUnionTypeFirstElement(node, { comment, text, options }) {
  if (
    isUnionType(node) &&
    isSingleLineBlockComment(comment, text) &&
    !isPrettierIgnoreComment(comment)
  ) {
    const text = stripComments(options);
    const textBetween = text.slice(locEnd(comment), locStart(node));
    return /^[ \t]*$/.test(textBetween);
  }

  return false;
}

function addLeadingCommentToPossibleUnionType(node, context) {
  addLeadingComment(
    shouldAttachToUnionTypeFirstElement(node, context) ? node.types[0] : node,
    context.comment,
  );
  return true;
}

export {
  addLeadingCommentToPossibleUnionType,
  shouldAttachToUnionTypeFirstElement,
};
