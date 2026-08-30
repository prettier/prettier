import { group, hardline, indent, softline } from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import { locEnd } from "../location/index.js";
import { isLineComment } from "../utilities/comment-types.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isIndentableBlockComment } from "../utilities/indentable-block-comment.js";
import {
  isCallOrNewExpression,
  isMemberExpression,
  isSatisfiesExpression,
  isUnionType,
} from "../utilities/node-types.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");

  const keepTypeOnOwnLine =
    !isUnionType(node.typeAnnotation) &&
    hasComment(
      node.typeAnnotation,
      CommentCheckFlags.Leading,
      (comment) =>
        hasNewline(options.originalText, locEnd(comment)) &&
        (isLineComment(comment) || isIndentableBlockComment(comment)),
    );

  const parts = [
    print("expression"),
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
    keepTypeOnOwnLine
      ? indent([hardline, typeAnnotationDoc])
      : [" ", typeAnnotationDoc],
  ];

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  return parts;
}

export { printBinaryCastExpression };
