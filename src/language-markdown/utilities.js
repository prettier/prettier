import * as assert from "#universal/assert";
import { CJK_REGEXP, PUNCTUATION_REGEXP } from "./constants.evaluate.js";
import { locEnd, locStart } from "./loc.js";

const INLINE_NODE_TYPES = new Set([
  "liquidNode",
  "inlineCode",
  "emphasis",
  "esComment",
  "strong",
  "delete",
  "wikiLink",
  "link",
  "linkReference",
  "image",
  "imageReference",
  "footnote",
  "footnoteReference",
  "sentence",
  "whitespace",
  "word",
  "break",
  "inlineMath",
]);

const INLINE_NODE_WRAPPER_TYPES = new Set([
  ...INLINE_NODE_TYPES,
  "tableCell",
  "paragraph",
  "heading",
]);

const KIND_NON_CJK = "non-cjk";
const KIND_CJ_LETTER = "cj-letter";
const KIND_K_LETTER = "k-letter";
const KIND_CJK_PUNCTUATION = "cjk-punctuation";

const K_REGEXP = /\p{Script_Extensions=Hangul}/u;

/**
 * @typedef {" " | "\n" | ""} WhitespaceValue
 * @typedef { KIND_NON_CJK | KIND_CJ_LETTER | KIND_K_LETTER | KIND_CJK_PUNCTUATION } WordKind
 * @typedef {{
 *   type: "whitespace",
 *   value: WhitespaceValue,
 *   kind?: never
 * }} WhitespaceNode
 * @typedef {{
 *   type: "word",
 *   value: string,
 *   kind: WordKind,
 *   isCJ: boolean,
 *   hasLeadingPunctuation: boolean,
 *   hasTrailingPunctuation: boolean,
 * }} WordNode
 * Node for a single CJK character or a sequence of non-CJK characters
 * @typedef {WhitespaceNode | WordNode} TextNode
 */

/**
 * split text into whitespaces and words
 * @param {string} text
 */
function splitText(text) {
  /** @type {Array<TextNode>} */
  const nodes = [];

  const tokens = text.split(/([\t\n ]+)/);
  for (const [index, token] of tokens.entries()) {
    // whitespace
    if (index % 2 === 1) {
      nodes.push({
        type: "whitespace",
        value: /\n/.test(token) ? "\n" : " ",
      });
      continue;
    }

    // word separated by whitespace

    if ((index === 0 || index === tokens.length - 1) && token === "") {
      continue;
    }

    const innerTokens = token.split(new RegExp(`(${CJK_REGEXP.source})`, "u"));
    for (const [innerIndex, innerToken] of innerTokens.entries()) {
      if (
        (innerIndex === 0 || innerIndex === innerTokens.length - 1) &&
        innerToken === ""
      ) {
        continue;
      }

      // non-CJK word
      if (innerIndex % 2 === 0) {
        if (innerToken !== "") {
          appendNode({
            type: "word",
            value: innerToken,
            kind: KIND_NON_CJK,
            isCJ: false,
            hasLeadingPunctuation: PUNCTUATION_REGEXP.test(innerToken[0]),
            hasTrailingPunctuation: PUNCTUATION_REGEXP.test(innerToken.at(-1)),
          });
        }
        continue;
      }

      // CJK character

      // punctuation for CJ(K)
      // Korean doesn't use them in horizontal writing usually
      if (PUNCTUATION_REGEXP.test(innerToken)) {
        appendNode({
          type: "word",
          value: innerToken,
          kind: KIND_CJK_PUNCTUATION,
          isCJ: true,
          hasLeadingPunctuation: true,
          hasTrailingPunctuation: true,
        });
        continue;
      }

      // Korean uses space to divide words, but Chinese & Japanese do not
      // This is why Korean should be treated like non-CJK
      if (K_REGEXP.test(innerToken)) {
        appendNode({
          type: "word",
          value: innerToken,
          kind: KIND_K_LETTER,
          isCJ: false,
          hasLeadingPunctuation: false,
          hasTrailingPunctuation: false,
        });
        continue;
      }

      appendNode({
        type: "word",
        value: innerToken,
        kind: KIND_CJ_LETTER,
        isCJ: true,
        hasLeadingPunctuation: false,
        hasTrailingPunctuation: false,
      });
    }
  }

  // Check for `canBeConvertedToSpace` in ./print-whitespace.js etc.
  if (process.env.NODE_ENV !== "production") {
    for (let i = 1; i < nodes.length; i++) {
      assert.ok(
        !(nodes[i - 1].type === "whitespace" && nodes[i].type === "whitespace"),
        "splitText should not create consecutive whitespace nodes",
      );
    }
  }

  return nodes;

  function appendNode(node) {
    const lastNode = nodes.at(-1);
    if (
      lastNode?.type === "word" &&
      !isBetween(KIND_NON_CJK, KIND_CJK_PUNCTUATION) &&
      // disallow leading/trailing full-width whitespace
      ![lastNode.value, node.value].some((value) => /\u3000/.test(value))
    ) {
      nodes.push({ type: "whitespace", value: "" });
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

function getOrderedListItemInfo(orderListItem, options) {
  const text = options.originalText.slice(
    orderListItem.position.start.offset,
    orderListItem.position.end.offset,
  );

  const { numberText, leadingSpaces } = text.match(
    /^\s*(?<numberText>\d+)(\.|\))(?<leadingSpaces>\s*)/,
  ).groups;

  return { number: Number(numberText), leadingSpaces };
}

function hasGitDiffFriendlyOrderedList(node, options) {
  if (!node.ordered || node.children.length < 2) {
    return false;
  }

  const secondNumber = getOrderedListItemInfo(node.children[1], options).number;

  if (secondNumber !== 1) {
    return false;
  }

  const firstNumber = getOrderedListItemInfo(node.children[0], options).number;

  if (firstNumber !== 0) {
    return true;
  }

  return (
    node.children.length > 2 &&
    getOrderedListItemInfo(node.children[2], options).number === 1
  );
}

// The final new line should not include in value
// https://github.com/remarkjs/remark/issues/512
function getFencedCodeBlockValue(node, originalText) {
  const { value } = node;
  if (
    node.position.end.offset === originalText.length &&
    value.endsWith("\n") &&
    // Code block has no end mark
    originalText.endsWith("\n")
  ) {
    return value.slice(0, -1);
  }
  return value;
}

function mapAst(ast, handler) {
  return (function preorder(node, index, parentStack) {
    const newNode = { ...handler(node, index, parentStack) };
    if (newNode.children) {
      newNode.children = newNode.children.map((child, index) =>
        preorder(child, index, [newNode, ...parentStack]),
      );
    }

    return newNode;
  })(ast, null, []);
}

function isAutolink(node) {
  if (node?.type !== "link" || node.children.length !== 1) {
    return false;
  }
  const [child] = node.children;
  return locStart(node) === locStart(child) && locEnd(node) === locEnd(child);
}

/** @return {false | 'next' | 'start' | 'end'} */
function isPrettierIgnore(node) {
  let match;

  if (node.type === "html") {
    match = node.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/);
  } else {
    let comment;

    if (node.type === "esComment") {
      comment = node;
    } else if (
      node.type === "paragraph" &&
      node.children.length === 1 &&
      node.children[0].type === "esComment"
    ) {
      comment = node.children[0];
    }

    if (comment) {
      match = comment.value.match(/^prettier-ignore(?:-(start|end))?$/);
    }
  }

  return match ? match[1] || "next" : false;
}

function getNthListSiblingIndex(node, parentNode) {
  return getNthSiblingIndex(
    node,
    parentNode,
    (siblingNode) => siblingNode.ordered === node.ordered,
  );

  function getNthSiblingIndex(node, parentNode, condition) {
    let index = -1;

    for (const childNode of parentNode.children) {
      if (childNode.type === node.type && condition(childNode)) {
        index++;
      } else {
        index = -1;
      }

      if (childNode === node) {
        return index;
      }
    }
  }
}

function hasPrettierIgnore(path) {
  return path.index > 0 && isPrettierIgnore(path.previous) === "next";
}

export {
  getFencedCodeBlockValue,
  getNthListSiblingIndex,
  getOrderedListItemInfo,
  hasGitDiffFriendlyOrderedList,
  hasPrettierIgnore,
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
  isAutolink,
  isPrettierIgnore,
  KIND_CJ_LETTER,
  KIND_CJK_PUNCTUATION,
  KIND_K_LETTER,
  KIND_NON_CJK,
  mapAst,
  splitText,
};
