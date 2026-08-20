import { group, indent, softline } from "../../document/index.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { printForXStatementBody } from "./clause.js";

// A line comment on either side of the head has to be followed by a newline, so a flat head cannot
// hold it and it ends up after the closing parenthesis instead. Comments nested deeper print inside
// whatever holds them, so they leave the head alone.
function headHasLineComment(node) {
  return (
    hasComment(node.left, CommentCheckFlags.Line) ||
    hasComment(node.right, CommentCheckFlags.Line)
  );
}

function printForXStatement(path, options, print) {
  const { node } = path;
  const isForOfStatement = node.type === "ForOfStatement";
  const headParts = [
    print("left"),
    " ",
    isForOfStatement ? "of" : "in",
    " ",
    print("right"),
  ];

  return group([
    "for",
    isForOfStatement && node.await ? " await" : "",
    " (",
    headHasLineComment(node)
      ? group([indent([softline, headParts]), softline])
      : headParts,
    ")",
    printForXStatementBody(path, options, print),
  ]);
}

export { printForXStatement };
