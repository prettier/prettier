import babelParsers from "../language-js/parse/babel.js";
import jsonParsers from "../language-json/parser-json.js";

export const parsers = { ...babelParsers, ...jsonParsers };
export default { parsers };
