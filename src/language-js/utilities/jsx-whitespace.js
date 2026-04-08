import WhitespaceUtilities from "../../utilities/whitespace-utilities.js";

/*
Only the following are treated as whitespace inside JSX.

- U+0020 SPACE
- U+000A LF
- U+000D CR
- U+0009 TAB
*/
const jsxWhitespace = new WhitespaceUtilities(" \n\r\t");

export { jsxWhitespace };
