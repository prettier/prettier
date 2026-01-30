import { indent, line } from "../../document/index.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";

function printClause(path, print, property = "body") {
  return path.call(({ node }) => {
    const doc = print();

    if (node.type === "EmptyStatement") {
      return hasComment(node, CommentCheckFlags.Leading) ? [" ", doc] : doc;
    }

    if (
      node.type === "BlockStatement" ||
      (node.type === "IfStatement" &&
        path.parent.type === "IfStatement" &&
        path.key === "alternate")
    ) {
      return [" ", doc];
    }

    return indent([line, doc]);
  }, property);
}

const printIfStatementConsequent = (path, print) =>
  printClause(path, print, "consequent");
const printIfStatementAlternate = (path, print) =>
  printClause(path, print, "alternate");

export {
  printClause as printDoWhileStatementBody,
  printClause as printForInStatementBody,
  printClause as printForOfStatementBody,
  printClause as printForStatementBody,
  printIfStatementAlternate,
  printIfStatementConsequent,
  printClause as printWhileStatementBody,
};
