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

  return text.replaceAll(regex, replacement);
}

export { replaceAlignedCode };
