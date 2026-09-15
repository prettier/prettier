import {
  group,
  hardline,
  indent,
  join,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { isLineComment } from "../utilities/comment-types.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
import { isNextLineEmpty } from "../utilities/is-next-line-empty.js";
import { printStatementSequence } from "./statement-sequence.js";

function printSwitchStatement(path, options, print) {
  const commentsAfterDiscriminant = getComments(
    path.node,
    CommentCheckFlags.Dangling,
    (comment) => comment.marker === "commentAfterDiscriminant",
  );
  const printedCommentsAfterDiscriminant =
    commentsAfterDiscriminant.length === 0
      ? ""
      : [
          " ",
          printDanglingComments(path, options, {
            marker: "commentAfterDiscriminant",
          }),
          commentsAfterDiscriminant.some(isLineComment) ? hardline : "",
        ];
  const openingBrace = commentsAfterDiscriminant.some(isLineComment)
    ? "{"
    : " {";

  return [
    group([
      "switch (",
      indent([softline, print("discriminant")]),
      softline,
      ")",
    ]),
    printedCommentsAfterDiscriminant,
    openingBrace,
    path.node.cases.length > 0
      ? indent([
          hardline,
          join(
            hardline,
            path.map(
              ({ node, isLast }) => [
                print(),
                !isLast && isNextLineEmpty(node, options) ? hardline : "",
              ],
              "cases",
            ),
          ),
        ])
      : printDanglingComments(path, options, { indent: true }),
    hardline,
    "}",
  ];
}

function printSwitchCase(path, options, print) {
  const { node } = path;
  const parts = [];
  if (node.test) {
    parts.push("case ", print("test"), ":");
  } else {
    parts.push("default:");
  }

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(" ", printDanglingComments(path, options));
  }

  const consequent = node.consequent.filter(
    (node) => node.type !== "EmptyStatement",
  );

  if (consequent.length > 0) {
    const cons = printStatementSequence(path, options, print, "consequent");

    parts.push(
      consequent.length === 1 && consequent[0].type === "BlockStatement"
        ? [" ", cons]
        : indent([hardline, cons]),
    );
  }

  return parts;
}

export { printSwitchCase, printSwitchStatement };
