import { hardline, indent, line } from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";

function shouldPrintLeadingHardline(node, options) {
  const leadingComments = getComments(node, CommentCheckFlags.Leading);
  if (leadingComments.length === 0) {
    return false;
  }

  const [firstComment] = leadingComments;
  const text = options.originalText;
  const start = locStart(firstComment);

  return (
    hasNewlineInRange(text, start, locEnd(firstComment)) ||
    hasNewline(text, start, { backwards: true })
  );
}

function printClause(path, options, print, property = "body") {
  return path.call(({ node }) => {
    const doc = print();

    if (node.type === "EmptyStatement") {
      return hasComment(node, CommentCheckFlags.Leading) ? [" ", doc] : doc;
    }

    const isBlockStatement = node.type === "BlockStatement";

    if (shouldPrintLeadingHardline(node, options)) {
      return isBlockStatement ? [hardline, doc] : indent([hardline, doc]);
    }

    if (
      isBlockStatement ||
      (node.type === "IfStatement" &&
        path.parent.type === "IfStatement" &&
        path.key === "alternate")
    ) {
      return [" ", doc];
    }

    return indent([line, doc]);
  }, property);
}

const printIfStatementConsequent = (path, options, print) =>
  printClause(path, options, print, "consequent");
const printIfStatementAlternate = (path, options, print) =>
  printClause(path, options, print, "alternate");

export {
  printClause as printDoWhileStatementBody,
  printClause as printForInStatementBody,
  printClause as printForOfStatementBody,
  printClause as printForStatementBody,
  printIfStatementAlternate,
  printIfStatementConsequent,
  printClause as printWhileStatementBody,
};
