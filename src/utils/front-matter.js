"use strict";

const {
  builders: { hardline, literalline, concat, markAsRoot },
  utils: { mapDoc },
} = require("../document");

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
      `^(${delimiterRegex})([^\\n]*)\\n(?:([\\s\\S]*?)\\n)?\\1[^\\n\\S]*(\\n|$)`
    )
  );

  if (match === null) {
    return { frontMatter: null, content: text };
  }

  const [raw, delimiter, language, value] = match;
  let lang = DELIMITER_MAP[delimiter];
  if (lang !== "toml" && language && language.trim()) {
    lang = language.trim();
  }

  return {
    frontMatter: {
      type: "front-matter",
      lang,
      value,
      raw: raw.replace(/\n$/, ""),
    },
    content: raw.replace(/[^\n]/g, " ") + text.slice(raw.length),
  };
}

function print(node, textToDoc) {
  if (node.lang === "yaml") {
    const value = node.value.trim();
    const doc = value
      ? replaceNewlinesWithLiterallines(textToDoc(value, { parser: "yaml" }))
      : "";
    return markAsRoot(
      concat(["---", hardline, doc, doc ? hardline : "", "---"])
    );
  }
}

function replaceNewlinesWithLiterallines(doc) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? concat(
          currentDoc
            .split(/(\n)/g)
            .map((v, i) => (i % 2 === 0 ? v : literalline))
        )
      : currentDoc
  );
}

module.exports = { parse, print };
