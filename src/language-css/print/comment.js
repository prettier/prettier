import { locEnd, locStart } from "../loc.js";

function printComment(path, options, print) {
  const { node } = path;
  return "/* " + node.text + " */";
}

function printCommentLegacy(path, options, print) {
  const { node } = path;

  const isInlineComment = node.inline || node.raws.inline;

  const text = options.originalText.slice(locStart(node), locEnd(node));

  return isInlineComment ? text.trimEnd() : text;
}

export { printComment, printCommentLegacy };
