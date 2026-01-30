import { group, hardline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import { locEnd, locStart } from "../loc.js";
import { isLineComment } from "../utilities/comment-types.js";
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
  if (!isConsequentBlockStatement) {
    parts.push(hardline);
    needSpace = false;
  }

  const danglingComments = getComments(node, CommentCheckFlags.Dangling);
  if (danglingComments.length > 0) {
    const [firstComment] = danglingComments;

    if (isPreviousLineEmpty(firstComment, options)) {
      parts.push(isConsequentBlockStatement ? [hardline, hardline] : hardline);
    } else if (
      hasNewline(options.originalText, locStart(firstComment), {
        backwards: true,
      })
    ) {
      parts.push(isConsequentBlockStatement ? hardline : "");
    } else {
      parts.push(" ");
    }

    parts.push(
      printDanglingComments(path, options),
      needsHardlineAfterDanglingComment(node) ||
        hasNewline(options.originalText, locEnd(danglingComments.at(-1)))
        ? hardline
        : " ",
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
