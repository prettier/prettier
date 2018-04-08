"use strict";

const pragmas = ["format", "prettier"];

function startWithPragma(text) {
  const pragma = `@(${pragmas.join("|")})`;
  const regex = new RegExp(
    [
      `<!--\\s*${pragma}\\s*-->`,
      `<!--.*\n[\\s\\S]*(^|\n)[^\\S\n]*${pragma}[^\\S\n]*($|\n)[\\s\\S]*\n.*-->`
    ].join("|"),
    "m"
  );
  const matched = text.match(regex);
  return matched && matched.index === 0;
}

function extract(text) {
  // yaml (---) and toml (+++)
  const matched = text.match(
    /^((---|\+\+\+)(?:\n[\s\S]*?\n|\n)\2(?:\n|$))?([\s\S]*)/
  );
  const frontMatter = matched[1];
  const mainContent = matched[3];
  return { frontMatter, mainContent };
}

module.exports = {
  startWithPragma,
  hasPragma: text => startWithPragma(extract(text).mainContent.trimLeft()),
  insertPragma: text => {
    const extracted = extract(text);
    const pragma = `<!-- @${pragmas[0]} -->`;
    return extracted.frontMatter
      ? `${extracted.frontMatter}\n\n${pragma}\n\n${extracted.mainContent}`
      : `${pragma}\n\n${extracted.mainContent}`;
  }
};
