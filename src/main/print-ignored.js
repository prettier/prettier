function printIgnored(path, options) {
  const {
    originalText,
    [Symbol.for("comments")]: comments,
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

  return originalText.slice(start, end);
}

export default printIgnored;
