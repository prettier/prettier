import * as assert from "#universal/assert";
import { locEnd, locStart } from "../loc.js";

function replaceNonEolCharactersWithSpace(text) {
  return text.replaceAll(/[^\n]/gu, " ");
}

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

    text =
      text.slice(0, commentStart - start) +
      replaceNonEolCharactersWithSpace(text.slice(commentStart, commentEnd)) +
      text.slice(commentEnd - start);
  }

  if (process.env.NODE_ENV !== "production") {
    assert.ok(text.length === end - start);
  }

  return text;
}

export default getTextWithoutComments;
