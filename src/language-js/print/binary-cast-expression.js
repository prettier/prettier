import { group, hardline, indent, softline } from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import { locEnd } from "../location/index.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import {
  isCallOrNewExpression,
  isMemberExpression,
  isSatisfiesExpression,
} from "../utilities/node-types.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");

  // A union already prints its members on their own lines, so it does not need the
  // break and would end up indented twice.
  const isUnion =
    node.typeAnnotation?.type === "TSUnionType" ||
    node.typeAnnotation?.type === "UnionTypeAnnotation";

  // A line comment written on its own line before the type has to stay there.
  // Printing it after the operator makes it a trailing comment, and the next format
  // then moves it to the end of the statement.
  const keepTypeOnOwnLine =
    !isFlowAsConstExpression &&
    !isUnion &&
    hasComment(
      node.typeAnnotation,
      CommentCheckFlags.Leading | CommentCheckFlags.Line,
      (comment) => hasNewline(options.originalText, locEnd(comment)),
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
