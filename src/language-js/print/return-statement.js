import {
  group,
  hardline,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import {
  CommentCheckFlags,
  hasComment,
  isBinaryish,
} from "../utilities/index.js";
import { returnArgumentHasLeadingComment } from "../utilities/return-statement-has-leading-comment.js";

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
    options.semi &&
    hasDanglingComments &&
    hasComment(node, CommentCheckFlags.Last | CommentCheckFlags.Line);

  if (shouldPrintSemiBeforeComments) {
    parts.push(";");
  }

  if (hasDanglingComments) {
    parts.push(" ", printDanglingComments(path, options));
  }

  if (!shouldPrintSemiBeforeComments && options.semi) {
    parts.push(";");
  }

  return parts;
}

export {
  printReturnOrThrowStatement as printReturnStatement,
  printReturnOrThrowStatement as printThrowStatement,
};
