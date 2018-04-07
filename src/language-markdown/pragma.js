"use strict";

const pragmas = ["format", "prettier"];
const startWithPragmaRegex = new RegExp(
  `^<!--\\s*@(${pragmas.join("|")})\\s*-->`
);

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
  startWithPragmaRegex,
  hasPragma: text =>
    startWithPragmaRegex.test(extract(text).mainContent.trimLeft()),
  insertPragma: text => {
    const extracted = extract(text);
    const pragma = `<!-- @${pragmas[0]} -->`;
    return extracted.frontMatter
      ? `${extracted.frontMatter}\n\n${pragma}\n\n${extracted.mainContent}`
      : `${pragma}\n\n${extracted.mainContent}`;
  }
};
