import hasNewline from "../../utilities/has-newline.js";
import { locEnd, locStart } from "../location/index.js";
import { CommentCheckFlags, getComments } from "./comments.js";
import { isClassProperty } from "./node-types.js";
import { stripComments } from "./strip-comments.js";

function getClassPropertyTypeComment({ node }, options) {
  if (!isClassProperty(node) || node.value || node.typeAnnotation) {
    return;
  }

  return getComments(
    node,
    CommentCheckFlags.Trailing | CommentCheckFlags.Block,
    (comment) =>
      comment.value.startsWith(":") &&
      !hasNewline(options.originalText, locStart(comment), {
        backwards: true,
      }) &&
      stripComments(options).slice(locEnd(node), locStart(comment)).trim()
        .length === 0,
  ).at(-1);
}

export { getClassPropertyTypeComment };
