import {
  group,
  hardline,
  indent,
  join,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import { locStart } from "../location/index.js";
import { isLineComment } from "../utilities/comment-types.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
import { isNextLineEmpty } from "../utilities/is-next-line-empty.js";
import { printStatementSequence } from "./statement-sequence.js";

function printSwitchStatement(path, options, print) {
  const { node } = path;
  const commentsAfterDiscriminant = getComments(
    node,
    CommentCheckFlags.Dangling,
    (comment) => comment.marker === "commentAfterSwitchDiscriminant",
  );
  const firstCommentAfterDiscriminant = commentsAfterDiscriminant[0];
  const commentAfterDiscriminantIsOnOwnLine =
    firstCommentAfterDiscriminant &&
    hasNewline(options.originalText, locStart(firstCommentAfterDiscriminant), {
      backwards: true,
    });
  const commentAfterDiscriminant = firstCommentAfterDiscriminant
    ? [
        commentAfterDiscriminantIsOnOwnLine ? hardline : " ",
        printDanglingComments(path, options, {
          marker: "commentAfterSwitchDiscriminant",
        }),
        isLineComment(commentsAfterDiscriminant.at(-1)) ||
        commentAfterDiscriminantIsOnOwnLine
          ? hardline
          : " ",
      ]
    : " ";

  return [
    group([
      "switch (",
      indent([softline, print("discriminant")]),
      softline,
      ")",
    ]),
    commentAfterDiscriminant,
    "{",
    node.cases.length > 0
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
