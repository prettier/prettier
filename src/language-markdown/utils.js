"use strict";

const escapeStringRegexp = require("escape-string-regexp");
const getCjkRegex = require("cjk-regex");
const getUnicodeRegex = require("unicode-regex");
const { getLast } = require("../common/util");

const cjkPattern = getCjkRegex().source;

// http://spec.commonmark.org/0.25/#ascii-punctuation-character
const asciiPunctuationCharRange = escapeStringRegexp(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
);

// http://spec.commonmark.org/0.25/#punctuation-character
const punctuationCharRange = `${asciiPunctuationCharRange}${getUnicodeRegex([
  "Pc",
  "Pd",
  "Pe",
  "Pf",
  "Pi",
  "Po",
  "Ps"
]).source.slice(1, -1)}`; // remove bracket expression `[` and `]`

const punctuationRegex = new RegExp(`[${punctuationCharRange}]`);

/**
 * split text into whitespaces and words
 * @param {string} text
 * @return {Array<{ type: "whitespace", value: " " | "\n" | "" } | { type: "word", value: string }>}
 */
function splitText(text, options) {
  const KIND_NON_CJK = "non-cjk";
  const KIND_CJK_CHARACTER = "cjk-character";
  const KIND_CJK_PUNCTUATION = "cjk-punctuation";

  const nodes = [];

  (options.proseWrap === "preserve"
    ? text
    : text.replace(new RegExp(`(${cjkPattern})\n(${cjkPattern})`, "g"), "$1$2")
  )
    .split(/([ \t\n]+)/)
    .forEach((token, index, tokens) => {
      // whitespace
      if (index % 2 === 1) {
        nodes.push({
          type: "whitespace",
          value: /\n/.test(token) ? "\n" : " "
        });
        return;
      }

      // word separated by whitespace

      if ((index === 0 || index === tokens.length - 1) && token === "") {
        return;
      }

      token
        .split(new RegExp(`(${cjkPattern})`))
        .forEach((innerToken, innerIndex, innerTokens) => {
          if (
            (innerIndex === 0 || innerIndex === innerTokens.length - 1) &&
            innerToken === ""
          ) {
            return;
          }

          // non-CJK word
          if (innerIndex % 2 === 0) {
            if (innerToken !== "") {
              appendNode({
                type: "word",
                value: innerToken,
                kind: KIND_NON_CJK,
                hasLeadingPunctuation: punctuationRegex.test(innerToken[0]),
                hasTrailingPunctuation: punctuationRegex.test(
                  getLast(innerToken)
                )
              });
            }
            return;
          }

          // CJK character
          appendNode(
            punctuationRegex.test(innerToken)
              ? {
                  type: "word",
                  value: innerToken,
                  kind: KIND_CJK_PUNCTUATION,
                  hasLeadingPunctuation: true,
                  hasTrailingPunctuation: true
                }
              : {
                  type: "word",
                  value: innerToken,
                  kind: KIND_CJK_CHARACTER,
                  hasLeadingPunctuation: false,
                  hasTrailingPunctuation: false
                }
          );
        });
    });

  return nodes;

  function appendNode(node) {
    const lastNode = getLast(nodes);
    if (lastNode && lastNode.type === "word") {
      if (
        (lastNode.kind === KIND_NON_CJK &&
          node.kind === KIND_CJK_CHARACTER &&
          !lastNode.hasTrailingPunctuation) ||
        (lastNode.kind === KIND_CJK_CHARACTER &&
          node.kind === KIND_NON_CJK &&
          !node.hasLeadingPunctuation)
      ) {
        nodes.push({ type: "whitespace", value: " " });
      } else if (
        !isBetween(KIND_NON_CJK, KIND_CJK_PUNCTUATION) &&
        // disallow leading/trailing full-width whitespace
        ![lastNode.value, node.value].some(value => /\u3000/.test(value))
      ) {
        nodes.push({ type: "whitespace", value: "" });
      }
    }
    nodes.push(node);

    function isBetween(kind1, kind2) {
      return (
        (lastNode.kind === kind1 && node.kind === kind2) ||
        (lastNode.kind === kind2 && node.kind === kind1)
      );
    }
  }
}

function getOrderedListItemInfo(orderListItem, originalText) {
  const [, numberText, marker, leadingSpaces] = originalText
    .slice(
      orderListItem.position.start.offset,
      orderListItem.position.end.offset
    )
    .match(/^\s*(\d+)(\.|\))(\s*)/);

  return { numberText, marker, leadingSpaces };
}

module.exports = {
  splitText,
  punctuationCharRange,
  getOrderedListItemInfo
};
