import {
  group,
  hardline,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isBinaryish } from "../utilities/node-types.js";
import { returnArgumentHasLeadingComment } from "../utilities/return-statement-has-leading-comment.js";
import { printSemicolon } from "./miscellaneous.js";

/**
@import {Doc} from "../../document/index.js";
*/

function printReturnOrThrowArgument(path, options, print) {
  const { node } = path;
  const argumentDoc = print();

  if (returnArgumentHasLeadingComment(node, options)) {
    return ["(", indent([hardline, argumentDoc]), hardline, ")"];
  }

  if (
    isBinaryish(node) ||
    (options.experimentalTernaries &&
      node.type === "ConditionalExpression" &&
      (node.consequent.type === "ConditionalExpression" ||
        node.alternate.type === "ConditionalExpression"))
  ) {
    return group([
      ifBreak("("),
      indent([softline, argumentDoc]),
      softline,
      ifBreak(")"),
    ]);
  }

  return argumentDoc;
}

// `ReturnStatement` and `ThrowStatement`
function printReturnOrThrowStatement(path, options, print) {
  const { node } = path;
  /** @type {Doc[]} */
  const parts = [node.type === "ThrowStatement" ? "throw" : "return"];

  if (node.argument) {
    parts.push(
      " ",
      path.call(
        () => printReturnOrThrowArgument(path, options, print),
        "argument",
      ),
    );
  }

  const hasDanglingComments = hasComment(node, CommentCheckFlags.Dangling);
  const shouldPrintSemiBeforeComments =
    hasDanglingComments &&
    hasComment(node, CommentCheckFlags.Last | CommentCheckFlags.Line);

  if (shouldPrintSemiBeforeComments) {
    parts.push(printSemicolon(options));
  }

  // TODO[@fisker]: should able to remove this after we exclude `;` from range
  if (hasDanglingComments) {
    parts.push(" ", printDanglingComments(path, options));
  }

  if (!shouldPrintSemiBeforeComments) {
    parts.push(printSemicolon(options));
  }

  return parts;
}

export {
  printReturnOrThrowStatement as printReturnStatement,
  printReturnOrThrowStatement as printThrowStatement,
};
