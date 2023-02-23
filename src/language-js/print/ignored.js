import { printComments } from "../../main/comments/print.js";
import { hasJsxIgnoreComment } from "../print/jsx.js";
import { hasNodeIgnoreComment } from "../utils/index.js";
import { locStart, locEnd } from "../loc.js";

function isIgnored(path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

const cache = new WeakMap();
function getCommentsInsideNode(node, options) {
  if (!cache.has(node)) {
    const start = locStart(node);
    const end = locEnd(node);
    cache.set(
      node,
      options[Symbol.for("comments")].filter(
        (comment) => locStart(comment) >= start && locEnd(comment) <= end
      )
    );
  }

  return cache.get(node);
}

function printIgnored(path, options) {
  const { node } = path;
  const comments = getCommentsInsideNode(node, options);
  const printedComments = new Set(comments);
  for (const comment of comments) {
    comment.printed = true;
  }
  const text = options.originalText.slice(locStart(node), locEnd(node));
  return printComments(path, text, options, printedComments)
}

export { printIgnored, isIgnored };
