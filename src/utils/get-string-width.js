import emojiRegex from "emoji-regex";
import eastAsianWidth from "eastasianwidth";

const notAsciiRegex = /[^\x20-\x7F]/;

/**
 * @param {string} text
 * @returns {number}
 */
function getStringWidth(text) {
  if (!text) {
    return 0;
  }

  // shortcut to avoid needless string `RegExp`s, replacements, and allocations within `string-width`
  if (!notAsciiRegex.test(text)) {
    return text.length;
  }

  return eastAsianWidth.length(text.replace(emojiRegex(), "  "));
}

export default getStringWidth;
