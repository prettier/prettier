import * as acornParsers from "../language-js/parse/acorn.js";
import * as espreeParsers from "../language-js/parse/espree.js";

export const parsers = { ...acornParsers, ...espreeParsers };
