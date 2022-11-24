// This module only works in Node.js
// Will be replaced when bundling `standalone.js`

"use strict";

const path = require("path");
const { ConfigError } = require("../common/errors.js");
const { locStart, locEnd } = require("../language-js/loc.js");

function requireParser(parser) {
  try {
    return {
      parse: require(path.resolve(process.cwd(), parser)),
      astFormat: "estree",
      locStart,
      locEnd,
    };
  } catch {
    /* istanbul ignore next */
    throw new ConfigError(`Couldn't resolve parser "${parser}"`);
  }
}

module.exports = requireParser;
