import { commentsPropertyInOptions } from "../constants.js";

function printIgnored(path, options, printPath, args) {
  const {
    originalText,
    [commentsPropertyInOptions]: comments,
    locStart,
    locEnd,
    [Symbol.for("printedComments")]: printedComments,
  } = options;

  const { node } = path;
  const start = locStart(node);
  const end = locEnd(node);

  for (const comment of comments) {
    if (locStart(comment) >= start && locEnd(comment) <= end) {
      printedComments.add(comment);
    }
  }

  const { printPrettierIgnored } = options.printer;

  return printPrettierIgnored
    ? printPrettierIgnored(path, options, printPath, args)
    : originalText.slice(start, end);
}

export default printIgnored;
