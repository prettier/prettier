"use strict";

const escape = require("escape-string-regexp");
const {
  builders: { hardline, markAsRoot },
} = require("../document");

const YAML_DELIMITER = "---";
// In some markdown processors such as pandoc,
// "..." can be used as the end delimiter for YAML front-matter.
const YAML_END_DELIMITER = "...";
const DELIMITER_MAP = {
  [YAML_DELIMITER]: "yaml",
  "+++": "toml",
};

function parse(text) {
  const startDelimiterRegex = Object.keys(DELIMITER_MAP).map(escape).join("|");
  const endDelimiterRegex = Object.keys(DELIMITER_MAP)
    .concat(YAML_END_DELIMITER)
    .map(escape)
    .join("|");

  const match = text.match(
    // trailing spaces after delimiters are allowed
    new RegExp(
      `^(${startDelimiterRegex})([^\\n]*)\\n(?:|([\\s\\S]*?)\\n)(${endDelimiterRegex})[^\\n\\S]*(\\n|$)`
    )
  );

  if (match === null) {
    return { frontMatter: null, content: text };
  }

  const [raw, startDelimiter, language, value = "", endDelimiter] = match;

  let lang = DELIMITER_MAP[startDelimiter];
  if (lang !== "toml" && language && language.trim()) {
    lang = language.trim();
  }

  // Only allow yaml to parse with a different end delimiter
  if (
    startDelimiter !== endDelimiter &&
    !(
      lang === "yaml" &&
      startDelimiter === YAML_DELIMITER &&
      endDelimiter === YAML_END_DELIMITER
    )
  ) {
    return { frontMatter: null, content: text };
  }

  const frontMatter = {
    type: "front-matter",
    lang,
    value,
    startDelimiter,
    endDelimiter,
    raw: raw.replace(/\n$/, ""),
  };
  return {
    frontMatter,
    content: raw.replace(/[^\n]/g, " ") + text.slice(raw.length),
  };
}

function print(node, textToDoc) {
  if (node.lang === "yaml") {
    const value = node.value.trim();
    const doc = value
      ? textToDoc(value, { parser: "yaml" }, { stripTrailingHardline: true })
      : "";
    return markAsRoot([
      node.startDelimiter,
      hardline,
      doc,
      doc ? hardline : "",
      node.endDelimiter,
    ]);
  }
}

module.exports = { parse, print };
