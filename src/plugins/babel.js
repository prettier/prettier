import * as babelParsers from "../language-js/parse/babel.js";
// JSON parsers are based on babel, bundle together to reduce package size
import * as jsonParsers from "../language-json/parser-json.js";

export const parsers = { ...babelParsers, ...jsonParsers };
