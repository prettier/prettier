import WhitespaceUtilities from "./whitespace-utilities.js";

// https://infra.spec.whatwg.org/#ascii-whitespace
const HTML_WHITESPACE_CHARACTERS = ["\t", "\n", "\f", "\r", " "];
const htmlWhitespace = new WhitespaceUtilities(HTML_WHITESPACE_CHARACTERS);

export default htmlWhitespace;
