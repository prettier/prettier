import emojiRegex from "emoji-regex";
import eastAsianWidth from "eastasianwidth";

const notAsciiRegex = /[^\x20-\x7F]/;

// Based on https://github.com/sindresorhus/string-width
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

  text = text.replace(emojiRegex(), "  ");
  let width = 0;

  for (const character of text) {
    const codePoint = character.codePointAt(0);

    // Ignore control characters
    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      continue;
    }

    // Ignore combining characters
    if (codePoint >= 0x300 && codePoint <= 0x36f) {
      continue;
    }

    const code = eastAsianWidth.eastAsianWidth(character);
    switch (code) {
      case "F":
      case "W":
        width += 2;
        break;
      default:
        width += 1;
    }
  }

  return width;
}

export default getStringWidth;
