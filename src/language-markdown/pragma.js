"use strict";

const pragmas = ["format", "prettier"];
const startWithPragmaRegex = new RegExp(
  `^<!--\\s*@(${pragmas.join("|")})\\s*-->`
);

module.exports = {
  startWithPragmaRegex,
  hasPragma: text => startWithPragmaRegex.test(text.trimLeft()),
  insertPragma: text => `<!-- @${pragmas[0]} -->\n\n${text}`
};
