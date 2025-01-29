import emojiRegex from "emoji-regex";
// @ts-expect-error -- Special export for us, https://github.com/sindresorhus/get-east-asian-width/pull/6
import { _isNarrowWidth as isNarrowWidth } from "get-east-asian-width";

const notAsciiRegex = /[^\x20-\x7F]/u;

let segmenter;

/**
 * @param {string} text
 * @yields {string}
 */
function* splitString(text) {
  segmenter ??= new Intl.Segmenter();

  for (const { segment: character } of segmenter.segment(text)) {
    yield character;
  }
}

// Similar to https://github.com/sindresorhus/string-width
// We don't strip ansi, always treat ambiguous width characters as having narrow width.
/**
 * @param {string} text
 * @returns {number}
 */
function getStringWidth(text) {
  if (!text) {
    return 0;
  }

  // shortcut to avoid needless string `RegExp`s, replacements, and allocations
  if (!notAsciiRegex.test(text)) {
    return text.length;
  }

  text = text.replace(emojiRegex(), "  ");
  let width = 0;

  for (const character of splitString(text)) {
    const codePoint = character.codePointAt(0);

    // Ignore control characters
    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      continue;
    }

    // Ignore combining characters
    if (codePoint >= 0x300 && codePoint <= 0x36f) {
      continue;
    }

    width += isNarrowWidth(codePoint) ? 1 : 2;
  }

  return width;
}

export default getStringWidth;
