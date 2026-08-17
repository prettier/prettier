import {
  group,
  hardline,
  indent,
  join,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../location/index.js";
import { isLineComment } from "../utilities/comment-types.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
import { isNextLineEmpty } from "../utilities/is-next-line-empty.js";
import { printStatementSequence } from "./statement-sequence.js";

function printSwitchStatement(path, options, print) {
  const bodyComments = getComments(
    path.node,
    CommentCheckFlags.Dangling,
    (comment) => comment.marker === "body",
  );
  const [firstBodyComment] = bodyComments;
  const text = options.originalText;
  // Same condition `printClause` uses for the other block statements.
  const bodyCommentOnOwnLine =
    firstBodyComment &&
    (hasNewlineInRange(
      text,
      locStart(firstBodyComment),
      locEnd(firstBodyComment),
    ) ||
      hasNewline(text, locStart(firstBodyComment), { backwards: true }));
  // A line comment would otherwise swallow the brace that follows it.
  const bodyOnNextLine = bodyComments.some((comment) => isLineComment(comment));

  return [
    group([
      "switch (",
      indent([softline, print("discriminant")]),
      softline,
      ")",
    ]),
    firstBodyComment
      ? [
          bodyCommentOnOwnLine ? hardline : " ",
          printDanglingComments(path, options, { marker: "body" }),
          bodyOnNextLine ? hardline : " ",
        ]
      : " ",
    "{",
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
