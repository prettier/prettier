"use strict";

const frontMatterRegex = new RegExp(
  "^(?<startDelimiter>-{3}|\\+{3})" +
    // trailing spaces after delimiters are allowed
    "(?<language>[^\\n]*)" +
    "\\n(?:|(?<value>.*?)\\n)" +
    // In some markdown processors such as pandoc,
    // "..." can be used as the end delimiter for YAML front-matter.
    // Adding `\.{3}` make the regex matches `+++\n...`, but we'll exclude it later
    "(?<endDelimiter>\\k<startDelimiter>|\\.{3})" +
    "[^\\S\\n]*(?:\\n|$)",
  "s"
);

function parse(text) {
  const match = text.match(frontMatterRegex);
  if (!match) {
    return { content: text };
  }

  const { startDelimiter, language, value = "", endDelimiter } = match.groups;

  let lang = language.trim() || "yaml";
  if (startDelimiter === "+++") {
    lang = "toml";
  }

  // Only allow yaml to parse with a different end delimiter
  if (lang !== "yaml" && startDelimiter !== endDelimiter) {
    return { content: text };
  }

  const [raw] = match;
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

module.exports = parse;
