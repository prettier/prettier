"use strict";

const { locStart } = require("../loc");

const COMMA = ",";
function isCommaToken(token, { originalText }) {
  return (
    // Babel
    (token.type && token.type.label === COMMA) ||
    // Espree & Typescript
    (token.type === "Punctuator" && token.value === COMMA) ||
    // Flow
    token.type === "T_COMMA" ||
    // Meriyah
    (token.token === "Punctuator" &&
      originalText.charAt(locStart(token)) === COMMA)
  );
}

module.exports = isCommaToken;
