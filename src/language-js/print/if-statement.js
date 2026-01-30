import { group, hardline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { locStart } from "../loc.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
import { isPreviousLineEmpty } from "../utilities/is-previous-line-empty.js";
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
  const opening = group([
    "if (",
    printIfStatementCondition(path, options, print),
    ")",
    printIfStatementConsequent(path, options, print),
  ]);

  if (!node.alternate) {
    return opening;
  }

  const { consequent } = node;
  const isConsequentBlockStatement = consequent.type === "BlockStatement";

  /** @type {Doc[]} */
  const parts = [opening];
  let needSpace = isConsequentBlockStatement;
  if (
    !isConsequentBlockStatement ||
    hasComment(consequent, CommentCheckFlags.Trailing)
  ) {
    parts.push(hardline);
    needSpace = false;
  }

  const danglingComments = getComments(node, CommentCheckFlags.Dangling);
  if (danglingComments.length > 0) {
    const [firstComment] = danglingComments;

    parts.push(
      // There is empty line before
      isPreviousLineEmpty(firstComment, options) ? hardline : "",
      printDanglingComments(path, options),
      needsHardlineAfterDanglingComment(node) ? hardline : " ",
    );
    needSpace = false;
  }

  parts.push(
    needSpace ? " " : "",
    "else",
    group(printIfStatementAlternate(path, options, print)),
  );

  return parts;
}

export { printIfStatement };
