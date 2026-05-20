import { group, indent, softline } from "../../document/index.js";
import { printLeadingComments } from "../../main/comments/print.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
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

  const parts = [
    print("expression"),
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
    " ",
    typeAnnotationDoc,
  ];

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    const leadingComments = hasComment(node, CommentCheckFlags.Leading)
      ? printLeadingComments(path, options)
      : "";

    if (leadingComments) {
      const printedComments = options[Symbol.for("printedComments")];
      for (const comment of getComments(node, CommentCheckFlags.Leading)) {
        printedComments.add(comment);
      }
    }

    return group([indent([softline, leadingComments, ...parts]), softline]);
  }

  return parts;
}

export { printBinaryCastExpression };
