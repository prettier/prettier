"use strict";

const escape = require("escape-string-regexp");

const DELIMITER_MAP = {
  "---": "yaml",
  "+++": "toml",
};

function parse(text) {
  const delimiterRegex = Object.keys(DELIMITER_MAP).map(escape).join("|");

  const match = text.match(
    // trailing spaces after delimiters are allowed
    new RegExp(
      `^(${delimiterRegex})[^\\n\\S]*\\n(?:([\\s\\S]*?)\\n)?\\1[^\\n\\S]*(\\n|$)`
    )
  );

  if (match === null) {
    return { frontMatter: null, content: text };
  }

  const [raw, delimiter, value] = match;

  return {
    frontMatter: {
      type: DELIMITER_MAP[delimiter],
      value,
      raw: raw.replace(/\n$/, ""),
    },
    content: raw.replace(/[^\n]/g, " ") + text.slice(raw.length),
  };
}

module.exports = parse;
