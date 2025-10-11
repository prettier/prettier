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

    const startIndex = commentStart - start;
    const endIndex = commentEnd - start;

    text =
      text.slice(0, startIndex) +
      replaceNonEolCharactersWithSpace(text.slice(startIndex, endIndex)) +
      text.slice(endIndex);
  }

  if (process.env.NODE_ENV !== "production") {
    assert.equal(text.length, end - start);
  }

  return text;
}

export default getTextWithoutComments;
