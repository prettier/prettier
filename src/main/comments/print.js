import {
  breakParent,
  hardline,
  indent,
  join,
  line,
  lineSuffix,
} from "../../document/builders.js";
import { inheritLabel } from "../../document/utils.js";
import hasNewline from "../../utils/has-newline.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import isPreviousLineEmpty from "../../utils/is-previous-line-empty.js";
import { skipSpaces } from "../../utils/skip.js";
import skipNewline from "../../utils/skip-newline.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/builders.js"
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
    const lineBreak = hasNewline(originalText, locEnd(comment))
      ? hasNewline(originalText, locStart(comment), {
          backwards: true,
        })
        ? hardline
        : line
      : " ";

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
 * @param {{
 *  indent?: boolean,
 *  marker?: symbol,
 *  filter?: (comment) => boolean,
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

  const parts = [];
  path.each(({ node: comment }) => {
    if (
      comment.leading ||
      comment.trailing ||
      comment.marker !== marker ||
      !filter(comment)
    ) {
      return;
    }

    parts.push(printComment(path, options));
  }, "comments");

  if (parts.length === 0) {
    return "";
  }

  const doc = join(hardline, parts);
  return shouldIndent ? indent([hardline, doc]) : doc;
}

function printCommentsSeparately(path, options) {
  const value = path.node;
  if (!value) {
    return {};
  }

  const ignored = options[Symbol.for("printedComments")];
  const comments = (value.comments || []).filter(
    (comment) => !ignored.has(comment),
  );

  if (comments.length === 0) {
    return { leading: "", trailing: "" };
  }

  const leadingParts = [];
  const trailingParts = [];
  let printedTrailingComment;
  path.each(() => {
    const comment = path.node;
    if (ignored?.has(comment)) {
      return;
    }

    const { leading, trailing } = comment;
    if (leading) {
      leadingParts.push(printLeadingComment(path, options));
    } else if (trailing) {
      printedTrailingComment = printTrailingComment(
        path,
        options,
        printedTrailingComment,
      );
      trailingParts.push(printedTrailingComment.doc);
    }
  }, "comments");

  return { leading: leadingParts, trailing: trailingParts };
}

function printComments(path, doc, options) {
  const { leading, trailing } = printCommentsSeparately(path, options);
  if (!leading && !trailing) {
    return doc;
  }
  return inheritLabel(doc, (doc) => [leading, doc, trailing]);
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
};
