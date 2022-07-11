// This module only works in Node.js
// Will be replaced when bundling `standalone.js`

import { createRequire } from "node:module";
import path from "node:path";
import { ConfigError } from "../common/errors.js";
import { locStart, locEnd } from "../language-js/loc.js";

const require = createRequire(import.meta.url);

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

export default requireParser;
