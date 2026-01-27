import {
  breakParent,
  hardline,
  indent,
  inheritLabel,
  join,
  line,
  lineSuffix,
} from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import isPreviousLineEmpty from "../../utilities/is-previous-line-empty.js";
import { skipSpaces } from "../../utilities/skip.js";
import skipNewline from "../../utilities/skip-newline.js";

/**
@import AstPath from "../../common/ast-path.js"
@import {Doc, HardLine, Line} from "../../document/index.js"
@typedef {{
  filter?: (comment) => boolean,
}} CommentPrintOptions
*/

const returnTrue = () => true;

function printComment(path, options) {
  const comment = path.node;
  comment.printed = true;
  return options.printer.printComment(path, options);
}

function printLeadingComment(path, options) {
  const comment = path.node;
  const parts = [printComment(path, options)];

  const { printer, originalText, locStart, locEnd } = options;
  const isBlock = printer.isBlockComment?.(comment);

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    /** @type {HardLine | Line | " "} */
    let lineBreak = " ";
    if (hasNewline(originalText, locEnd(comment))) {
      if (hasNewline(originalText, locStart(comment), { backwards: true })) {
        lineBreak = hardline;
      } else {
        lineBreak = line;
      }
    }

    parts.push(lineBreak);
  } else {
    parts.push(hardline);
  }

  const index = skipNewline(
    originalText,
    skipSpaces(originalText, locEnd(comment)),
  );

  if (index !== false && hasNewline(originalText, index)) {
    parts.push(hardline);
  }

  return parts;
}

function printTrailingComment(path, options, previousComment) {
  const comment = path.node;
  const printed = printComment(path, options);

  const { printer, originalText, locStart } = options;
  const isBlock = printer.isBlockComment?.(comment);

  if (
    (previousComment?.hasLineSuffix && !previousComment?.isBlock) ||
    hasNewline(originalText, locStart(comment), { backwards: true })
  ) {
    // This allows comments at the end of nested structures:
    // {
    //   x: 1,
    //   y: 2
    //   // A comment
    // }
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.

    const isLineBeforeEmpty = isPreviousLineEmpty(
      originalText,
      locStart(comment),
    );

    return {
      doc: lineSuffix([hardline, isLineBeforeEmpty ? hardline : "", printed]),
      isBlock,
      hasLineSuffix: true,
    };
  }

  if (!isBlock || previousComment?.hasLineSuffix) {
    return {
      doc: [lineSuffix([" ", printed]), breakParent],
      isBlock,
      hasLineSuffix: true,
    };
  }

  return { doc: [" ", printed], isBlock, hasLineSuffix: false };
}

/**
 * @param {AstPath} path
 * @param {CommentPrintOptions & {
 *  indent?: boolean,
 *  marker?: symbol | string,
 * }} [danglingCommentsPrintOptions]
 * @returns {Doc}
 */
function printDanglingComments(
  path,
  options,
  danglingCommentsPrintOptions = {},
) {
  const { node } = path;

  if (!isNonEmptyArray(node?.comments)) {
    return "";
  }

  const {
    indent: shouldIndent = false,
    marker,
    filter = returnTrue,
  } = danglingCommentsPrintOptions;
  const danglingComments = new Set(
    node?.comments?.filter(
      (comment) =>
        !(
          comment.leading ||
          comment.trailing ||
          comment.marker !== marker ||
          !filter(comment)
        ),
    ),
  );

  const parts = path.map(
    ({ node: comment }) =>
      danglingComments.has(comment) ? printComment(path, options) : "",
    "comments",
  );

  if (parts.length === 0) {
    return "";
  }

  const doc = join(hardline, parts);
  return shouldIndent ? indent([hardline, doc]) : doc;
}

/**
@param {AstPath} path
@param {CommentPrintOptions} [printOptions]
@returns {Doc}
*/
function printLeadingComments(path, options, printOptions) {
  const { node } = path;
  const printed = options[Symbol.for("printedComments")];
  const filter = printOptions?.filter ?? returnTrue;
  const leadingComments = new Set(
    node?.comments?.filter(
      (comment) => !printed?.has(comment) && comment.leading && filter(comment),
    ),
  );

  if (leadingComments.size === 0) {
    return "";
  }

  return path
    .map(
      ({ node: comment }) =>
        leadingComments.has(comment) ? printLeadingComment(path, options) : "",
      "comments",
    )
    .filter(Boolean);
}

/**
@param {AstPath} path
@param {CommentPrintOptions} [printOptions]
@returns {Doc}
*/
function printTrailingComments(path, options, printOptions) {
  const { node } = path;
  const printed = options[Symbol.for("printedComments")];
  const filter = printOptions?.filter ?? returnTrue;
  const trailingComments = new Set(
    node?.comments?.filter((comment) => comment.trailing),
  );

  if (trailingComments.size === 0) {
    return "";
  }

  const docs = [];
  let printedTrailingComment;
  path.each(({ node: comment }) => {
    if (!trailingComments.has(comment)) {
      return;
    }

    printedTrailingComment = printTrailingComment(
      path,
      options,
      printedTrailingComment,
    );

    if (!printed?.has(comment) && filter(comment)) {
      docs.push(printedTrailingComment.doc);
    }
  }, "comments");

  return docs;
}

/**
@param {CommentPrintOptions} [printOptions]
@returns {{leading: Doc, trailing: Doc}}
*/
function printCommentsSeparately(path, options, printOptions) {
  return {
    leading: printLeadingComments(path, options, printOptions),
    trailing: printTrailingComments(path, options, printOptions),
  };
}

/**
@param {CommentPrintOptions} [printOptions]
@returns {Doc}
*/
function printComments(path, doc, options, printOptions) {
  const leading = printLeadingComments(path, options, printOptions);
  const trailing = printTrailingComments(path, options, printOptions);
  return leading || trailing
    ? inheritLabel(doc, (doc) => [leading, doc, trailing])
    : doc;
}

function ensureAllCommentsPrinted(options) {
  const {
    [Symbol.for("comments")]: comments,
    [Symbol.for("printedComments")]: printedComments,
  } = options;

  for (const comment of comments) {
    if (!comment.printed && !printedComments.has(comment)) {
      throw new Error(
        'Comment "' +
          comment.value.trim() +
          '" was not printed. Please report this error!',
      );
    }
    delete comment.printed;
  }
}

export {
  ensureAllCommentsPrinted,
  printComments,
  printCommentsSeparately,
  printDanglingComments,
  printLeadingComments,
};
