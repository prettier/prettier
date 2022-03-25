import escapeStringRegexp from "escape-string-regexp";

function replaceAlignedCode(text, { start, end, replacement }) {
  const regex = new RegExp(
    [
      "(?<=\\n)",
      "(?<indentString>\\s*)",
      escapeStringRegexp(start),
      "\\n",
      ".*?",
      "\\n",
      "\\k<indentString>",
      escapeStringRegexp(end),
      "(?=\\n)",
    ].join(""),
    "gs"
  );

  const replaced = text.replaceAll(regex, replacement);

  if (replaced === text) {
    console.log({ start, end, replacement });
    throw new Error("Code didn't change.");
  }

  return replaced;
}

export { replaceAlignedCode };
