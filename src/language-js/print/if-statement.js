import { group, hardline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import {
  CommentCheckFlags,
  hasComment,
  needsHardlineAfterDanglingComment,
} from "../utilities/index.js";
import { adjustClause, printIfStatementCondition } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

function printIfStatement(path, options, print) {
  const { node } = path;
  const consequent = adjustClause(node.consequent, print("consequent"));
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

    parts.push(
      "else",
      group(
        adjustClause(
          node.alternate,
          print("alternate"),
          node.alternate.type === "IfStatement",
        ),
      ),
    );
  }

  return parts;
}

export { printIfStatement };
