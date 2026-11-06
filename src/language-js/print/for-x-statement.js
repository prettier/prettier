import { group, hardline, indent } from "../../document/index.js";
import { locEnd } from "../location/index.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { stripComments } from "../utilities/strip-comments.js";
import { printForXStatementBody } from "./clause.js";

function printForXStatement(path, options, print) {
  const { node } = path;
  const isForOfStatement = node.type === "ForOfStatement";
  const keyword = isForOfStatement ? "of" : "in";
  const keywordIndex = stripComments(options).indexOf(
    keyword,
    locEnd(node.left),
  );
  const shouldBreak = hasComment(
    node.left,
    CommentCheckFlags.Trailing | CommentCheckFlags.Line,
    (comment) => locEnd(comment) <= keywordIndex,
  );
  const rightDoc = [keyword, " ", print("right")];

  return group([
    "for",
    isForOfStatement && node.await ? " await" : "",
    " (",
    print("left"),
    shouldBreak ? indent([hardline, rightDoc]) : [" ", rightDoc],
    ")",
    printForXStatementBody(path, options, print),
  ]);
}

export { printForXStatement };
