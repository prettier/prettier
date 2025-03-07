import assert from "node:assert";
import { locEnd, locStart } from "../loc.js";

function getTextWithoutComments(options, start, end) {
  let text = options.originalText.slice(start, end);

  for (const comment of options[Symbol.for("comments")]) {
    const commentStart = locStart(comment);
    // Comments are sorted, we can escape if the comment is after the range
    if (commentStart > end) {
      break;
    }

    const commentEnd = locEnd(comment);
    if (commentEnd < start) {
      continue;
    }

    const commentLength = commentEnd - commentStart;
    text =
      text.slice(0, commentStart - start) +
      " ".repeat(commentLength) +
      text.slice(commentEnd - start);
  }

  if (process.env.NODE_ENV !== "production") {
    assert.ok(text.length === end - start);
  }

  return text;
}

export default getTextWithoutComments;
