import { extract, parseWithComments, print, strip } from "jest-docblock";
import { normalizeEndOfLine } from "../common/end-of-line.js";
import {
  FORMAT_IGNORE_PRAGMAS,
  FORMAT_PRAGMA_TO_INSERT,
  FORMAT_PRAGMAS,
  JS_LINE_COMMENT_IGNORE_PRAGMA_REGEXP,
  JS_LINE_COMMENT_PRAGMA_REGEXP,
} from "../utilities/pragma/pragma.evaluate.js";
import getShebang from "./utilities/get-shebang.js";

function parseDocBlock(text) {
  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length + 1);
  }

  const docBlock = extract(text);
  const { pragmas, comments } = parseWithComments(docBlock);

  return { shebang, text, pragmas, comments };
}

// `jest-docblock` only sees the leading `/* */` block, so a pragma written as a
// line comment is invisible to it. Scan the line comments that lead the file,
// stopping at the first line that is neither blank nor a line comment.
function hasLineCommentPragma(text, regexp) {
  for (const line of strip(text).split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (!trimmed.startsWith("//")) {
      return false;
    }
    if (regexp.test(line)) {
      return true;
    }
  }

  return false;
}

function hasPragma(text) {
  const { text: textWithoutShebang, pragmas } = parseDocBlock(text);
  return (
    FORMAT_PRAGMAS.some((pragma) => Object.hasOwn(pragmas, pragma)) ||
    hasLineCommentPragma(textWithoutShebang, JS_LINE_COMMENT_PRAGMA_REGEXP)
  );
}

function hasIgnorePragma(text) {
  const { text: textWithoutShebang, pragmas } = parseDocBlock(text);
  return (
    FORMAT_IGNORE_PRAGMAS.some((pragma) => Object.hasOwn(pragmas, pragma)) ||
    hasLineCommentPragma(
      textWithoutShebang,
      JS_LINE_COMMENT_IGNORE_PRAGMA_REGEXP,
    )
  );
}

function insertPragma(originalText) {
  const { shebang, text, pragmas, comments } = parseDocBlock(originalText);
  const strippedText = strip(text);

  let docBlock = print({
    pragmas: {
      [FORMAT_PRAGMA_TO_INSERT]: "",
      ...pragmas,
    },
    comments: comments.trimStart(),
  });

  // normalise newlines (mitigate use of os.EOL by jest-docblock)
  // Only needed in development version on Windows,
  // bundler will hack `jest-docblock` enforce it to use `\n` in production
  if (process.env.NODE_ENV !== "production") {
    docBlock = normalizeEndOfLine(docBlock);
  }

  return (
    (shebang ? `${shebang}\n` : "") +
    docBlock +
    (strippedText.startsWith("\n") ? "\n" : "\n\n") +
    strippedText
  );
}

export { hasIgnorePragma, hasPragma, insertPragma };
