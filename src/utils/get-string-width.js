import emojiRegex from "emoji-regex";
// @ts-expect-error -- Special export for us, https://github.com/sindresorhus/get-east-asian-width/pull/6
import { _isNarrowWidth as isNarrowWidth } from "get-east-asian-width";

const notAsciiRegex = /[^\x20-\x7F]/u;

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

  text = text.replace(emojiRegex(), (match) =>
    narrowEmojis.has(match) ? " " : "  ",
  );
  let width = 0;

  // Use `Intl.Segmenter` when we drop support for Node.js v14
  // https://github.com/prettier/prettier/pull/14793#discussion_r1185840038
  // https://github.com/sindresorhus/string-width/pull/47
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

    // Ignore Variation Selectors
    if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
      continue;
    }

    width += isNarrowWidth(codePoint) ? 1 : 2;
  }

  return width;
}

const narrowEmojis = new Set([
  "\u{263A}", // ☺
  "\u{2639}", // ☹
  "\u{2620}", // ☠
  "\u{2763}", // ❣
  "\u{2764}", // ❤
  "\u{270C}", // ✌
  "\u{261D}", // ☝
  "\u{270D}", // ✍
  "\u{26F7}", // ⛷
  "\u{26F9}", // ⛹
  "\u{2618}", // ☘
  "\u{26E9}", // ⛩
  "\u{2668}", // ♨
  "\u{2708}", // ✈
  "\u{23F1}", // ⏱
  "\u{23F2}", // ⏲
  "\u{2600}", // ☀
  "\u{2601}", // ☁
  "\u{26C8}", // ⛈
  "\u{2602}", // ☂
  "\u{26F1}", // ⛱
  "\u{2744}", // ❄
  "\u{2603}", // ☃
  "\u{2604}", // ☄
  "\u{26F8}", // ⛸
  "\u{2660}", // ♠
  "\u{2665}", // ♥
  "\u{2666}", // ♦
  "\u{2663}", // ♣
  "\u{265F}", // ♟
  "\u{26D1}", // ⛑
  "\u{260E}", // ☎
  "\u{2328}", // ⌨
  "\u{2709}", // ✉
  "\u{270F}", // ✏
  "\u{2712}", // ✒
  "\u{2702}", // ✂
  "\u{26CF}", // ⛏
  "\u{2692}", // ⚒
  "\u{2694}", // ⚔
  "\u{2699}", // ⚙
  "\u{2696}", // ⚖
  "\u{26D3}", // ⛓
  "\u{2697}", // ⚗
  "\u{26B0}", // ⚰
  "\u{26B1}", // ⚱
  "\u{26A0}", // ⚠
  "\u{2622}", // ☢
  "\u{2623}", // ☣
  "\u{2B06}", // ⬆
  "\u{2197}", // ↗
  "\u{27A1}", // ➡
  "\u{2198}", // ↘
  "\u{2B07}", // ⬇
  "\u{2199}", // ↙
  "\u{2B05}", // ⬅
  "\u{2196}", // ↖
  "\u{2195}", // ↕
  "\u{2194}", // ↔
  "\u{21A9}", // ↩
  "\u{21AA}", // ↪
  "\u{2934}", // ⤴
  "\u{2935}", // ⤵
  "\u{269B}", // ⚛
  "\u{2721}", // ✡
  "\u{2638}", // ☸
  "\u{262F}", // ☯
  "\u{271D}", // ✝
  "\u{2626}", // ☦
  "\u{262A}", // ☪
  "\u{262E}", // ☮
  "\u{25B6}", // ▶
  "\u{25C0}", // ◀
  "\u{23F8}", // ⏸
  "\u{23F9}", // ⏹
  "\u{23FA}", // ⏺
  "\u{23CF}", // ⏏
  "\u{2640}", // ♀
  "\u{2642}", // ♂
  "\u{26A7}", // ⚧
  "\u{2716}", // ✖
  "\u{267E}", // ♾
  "\u{203C}", // ‼
  "\u{2049}", // ⁉
  "\u{2695}", // ⚕
  "\u{267B}", // ♻
  "\u{269C}", // ⚜
  "\u{2611}", // ☑
  "\u{2714}", // ✔
  "\u{2733}", // ✳
  "\u{2734}", // ✴
  "\u{2747}", // ❇
  "\u{00A9}", // ©
  "\u{00A9}", // ©
  "\u{00AE}", // ®
  "\u{2122}", // ™
  "\u{2139}", // ℹ
  "\u{25FC}", // ◼
  "\u{25FB}", // ◻
  "\u{25AA}", // ▪
  "\u{25AB}", // ▫
]);

export default getStringWidth;
