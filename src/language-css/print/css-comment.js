import { locEnd, locStart } from "../loc.js";

function printCssComment(path, options /* , print*/) {
  const { node } = path;
  const isInlineComment = node.inline || node.raws.inline;

  const text = options.originalText.slice(locStart(node), locEnd(node));

  return isInlineComment ? text.trimEnd() : text;
}

export { printCssComment };
