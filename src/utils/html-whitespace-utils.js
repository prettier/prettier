import WhitespaceUtils from "./whitespace-utils.js";

// https://infra.spec.whatwg.org/#ascii-whitespace
const HTML_WHITESPACE_CHARACTERS = ["\t", "\n", "\f", "\r", " "];
const htmlWhitespaceUtils = new WhitespaceUtils(HTML_WHITESPACE_CHARACTERS);

export default htmlWhitespaceUtils;
