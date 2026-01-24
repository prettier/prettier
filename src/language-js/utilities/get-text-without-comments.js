import replaceNonLineBreaksWithSpace from "../../utilities/replace-non-line-breaks-with-space.js";
import { locEnd, locStart } from "../loc.js";

function getTextWithoutComments(options, start, end) {
  let text = options.originalText.slice(start, end);

  for (const comment of options[Symbol.for("comments")]) {
    const commentStart = locStart(comment);
    // Comments are sorted, we can escape if the comment is after the range
    if (commentStart >= end) {
      break;
    }

    const commentEnd = locEnd(comment);
    if (commentEnd <= start) {
      continue;
    }

    const startIndex = Math.max(commentStart - start, 0);
    const endIndex = commentEnd - start;

    text =
      text.slice(0, startIndex) +
      replaceNonLineBreaksWithSpace(text.slice(startIndex, endIndex)) +
      text.slice(endIndex);
  }

  return text;
}

export default getTextWithoutComments;
