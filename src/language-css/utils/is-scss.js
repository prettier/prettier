"use strict";

function isSCSS(parser, text) {
  const hasExplicitParserChoice = parser === "less" || parser === "scss";
  const IS_POSSIBLY_SCSS = /(?:\w\s*:\s*[^:}]+|#){|@import[^\n]+(?:url|,)/;
  return hasExplicitParserChoice
    ? parser === "scss"
    : IS_POSSIBLY_SCSS.test(text);
}

module.exports = isSCSS;
