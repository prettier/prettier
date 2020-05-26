"use strict";

const DELIMITER_MAP = {
  "---": "yaml",
  "+++": "toml",
};

// trailing spaces after delimiters are allowed
const frontMatterRe = /^(-{3}|\+{3})[^\S\n]*\n(?:([\S\s]*?)\n)?\1[^\S\n]*(\n|$)/;

function parse(text) {
  const match = text.match(frontMatterRe);

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
