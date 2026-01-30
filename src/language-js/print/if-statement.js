import { group, hardline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { needsHardlineAfterDanglingComment } from "../utilities/needs-hardline-after-dangling-comment.js";
import {
  printIfStatementAlternate,
  printIfStatementConsequent,
} from "./clause.js";
import { printIfStatementCondition } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

function printIfStatement(path, options, print) {
  const { node } = path;
  const consequent = printIfStatementConsequent(path, options, print);
  const opening = group([
    "if (",
    printIfStatementCondition(path, options, print),
    ")",
    consequent,
  ]);
  /** @type{Doc[]} */
  const parts = [opening];

  if (node.alternate) {
    const commentOnOwnLine =
      hasComment(
        node.consequent,
        CommentCheckFlags.Trailing | CommentCheckFlags.Line,
      ) || needsHardlineAfterDanglingComment(node);
    const elseOnSameLine =
      node.consequent.type === "BlockStatement" && !commentOnOwnLine;
    parts.push(elseOnSameLine ? " " : hardline);

    if (hasComment(node, CommentCheckFlags.Dangling)) {
      parts.push(
        printDanglingComments(path, options),
        commentOnOwnLine ? hardline : " ",
      );
    }

    parts.push("else", group(printIfStatementAlternate(path, options, print)));
  }

  return parts;
}

export { printIfStatement };
