import { PUNCTUATION_REGEXP } from "../constants.evaluate.js";
import { isAutolink } from "../utilities.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/**
 * @param {AstPath} path
 * @return {Doc}
 */
function printWord(path) {
  const { node } = path;
  const emphasisOrStrong = path.findAncestor(
    (p) => p.type === "emphasis" || p.type === "strong",
  );
  if (!emphasisOrStrong) {
    return node.value;
  }
  const { previous, next, grandparent } = path;
  let text = node.value;

  // escape leading `*` or `_` if it's the first character in an emphasis/strong
  if (
    path.isFirst &&
    (text.startsWith("*") || text.startsWith("_")) &&
    path.callParent(() => path.isFirst) &&
    grandparent === emphasisOrStrong
  ) {
    text = `\\${text}`;
  }

  // escape internal `*` or `_` that can open or close emphasis/strong
  text = text.replaceAll(
    /(\\+|^|.)(\*+|_+)($|.)/gu,
    (match, preceding, delimiterRun, following) => {
      if (
        [...preceding].every((c) => c === "\\") &&
        preceding.length % 2 === 1
      ) {
        // already escaped
        return match;
      }
      if (
        canOpenOrCloseStrongOrEmphasis(
          preceding.at(-1) || previous?.value.at(-1),
          delimiterRun,
          following[0] || next?.value[0],
        )
      ) {
        return `${preceding}\\${delimiterRun}${following}`;
      }
      return match;
    },
  );

  return text;
}

/**
 * @param {string | undefined} preceding
 * @param {string} delimiterRun
 * @param {string | undefined} following
 * @returns {boolean | null}
 */
function canOpenOrCloseStrongOrEmphasis(preceding, delimiterRun, following) {
  if (!preceding || !following) {
    return null; // cannot determine
  }

  // https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis
  const followedByWhitespace = /[\p{Space_Separator}\t\n\f\r]/u.test(following);
  const precededByWhitespace = /[\p{Space_Separator}\t\n\f\r]/u.test(preceding);
  const followedByPunctuation = PUNCTUATION_REGEXP.test(following);
  const precededByPunctuation = PUNCTUATION_REGEXP.test(preceding);

  const isLeftFlanking =
    !followedByWhitespace &&
    (!followedByPunctuation ||
      (followedByPunctuation &&
        (precededByWhitespace || precededByPunctuation)));
  const isRightFlanking =
    !precededByWhitespace &&
    (!precededByPunctuation ||
      (precededByPunctuation &&
        (followedByWhitespace || followedByPunctuation)));

  const indicator = delimiterRun[0];
  if (indicator === "*") {
    return isLeftFlanking || isRightFlanking;
  }

  if (isLeftFlanking) {
    return !isRightFlanking || precededByPunctuation;
  }

  if (isRightFlanking) {
    return !isLeftFlanking || followedByPunctuation;
  }

  return false;
}

/**
 * @param {AstPath} path
 * @return {Doc}
 */
function printWordLegacy(path) {
  const { node } = path;
  let escapedValue = node.value
    .replaceAll("*", String.raw`\*`) // escape all `*`
    .replaceAll(
      new RegExp(
        [
          `(^|${PUNCTUATION_REGEXP.source})(_+)`,
          `(_+)(${PUNCTUATION_REGEXP.source}|$)`,
        ].join("|"),
        "gu",
      ),
      (_, text1, underscore1, underscore2, text2) =>
        (underscore1
          ? `${text1}${underscore1}`
          : `${underscore2}${text2}`
        ).replaceAll("_", String.raw`\_`),
    ); // escape all `_` except concating with non-punctuation, e.g. `1_2_3` is not considered emphasis

  const isFirstSentence = (node, name, index) =>
    node.type === "sentence" && index === 0;
  const isLastChildAutolink = (node, name, index) =>
    isAutolink(node.children[index - 1]);

  if (
    escapedValue !== node.value &&
    (path.match(undefined, isFirstSentence, isLastChildAutolink) ||
      path.match(
        undefined,
        isFirstSentence,
        (node, name, index) => node.type === "emphasis" && index === 0,
        isLastChildAutolink,
      ))
  ) {
    // backslash is parsed as part of autolinks, so we need to remove it
    escapedValue = escapedValue.replace(/^(\\?[*_])+/, (prefix) =>
      prefix.replaceAll("\\", ""),
    );
  }

  return escapedValue;
}

export { printWord, printWordLegacy };
