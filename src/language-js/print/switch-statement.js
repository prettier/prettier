import {
  group,
  hardline,
  indent,
  join,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
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
  const { node } = path;
  const switchString = options.originalText;
  const startOfSwitchBodyIndex = switchString.indexOf(
    "{",
    locEnd(node.discriminant),
  );

  const beforeBraceFilter = (comment) =>
    locStart(comment) < startOfSwitchBodyIndex;
  const insideBraceFilter = (comment) =>
    locStart(comment) >= startOfSwitchBodyIndex;

  const danglingComments = getComments(node, CommentCheckFlags.Dangling);
  const beforeBraceComments = danglingComments.filter(beforeBraceFilter);
  const hasDanglingCommentsBeforeBrace = beforeBraceComments.length > 0;
  const lastDanglingCommentBeforeBraceIsLine =
    hasDanglingCommentsBeforeBrace && isLineComment(beforeBraceComments.at(-1));

  return [
    group([
      "switch (",
      indent([softline, print("discriminant")]),
      softline,
      ")",
    ]),
    hasDanglingCommentsBeforeBrace
      ? [
          " ",
          printDanglingComments(path, options, {
            filter: beforeBraceFilter,
          }),
        ]
      : "",
    lastDanglingCommentBeforeBraceIsLine ? [hardline, "{"] : " {",
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
          danglingComments.some(insideBraceFilter)
            ? [
                hardline,
                printDanglingComments(path, options, {
                  filter: insideBraceFilter,
                }),
              ]
            : "",
        ])
      : printDanglingComments(path, options, {
          indent: true,
          filter: insideBraceFilter,
        }),
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
