import { hardline, line } from "../../document/builders.js";
import { isFrontMatter } from "../../utils/front-matter/index.js";
import hasNewline from "../../utils/has-newline.js";
import isNextLineEmpty from "../../utils/is-next-line-empty.js";
import { locEnd, locStart } from "../loc.js";

function printSequence(path, options, print) {
  const parts = [];
  path.each(() => {
    const { node, previous } = path;
    if (
      previous?.type === "css-comment" &&
      previous.text.trim() === "prettier-ignore"
    ) {
      parts.push(options.originalText.slice(locStart(node), locEnd(node)));
    } else {
      parts.push(print());
    }

    if (path.isLast) {
      return;
    }

    const { next } = path;
    if (
      (next.type === "css-comment" &&
        !hasNewline(options.originalText, locStart(next), {
          backwards: true,
        }) &&
        !isFrontMatter(node)) ||
      (next.type === "css-atrule" &&
        next.name === "else" &&
        node.type !== "css-comment")
    ) {
      parts.push(" ");
    } else {
      parts.push(options.__isHTMLStyleAttribute ? line : hardline);
      if (
        isNextLineEmpty(options.originalText, locEnd(node)) &&
        !isFrontMatter(node)
      ) {
        parts.push(hardline);
      }
    }
  }, "nodes");

  return parts;
}

export default printSequence;
