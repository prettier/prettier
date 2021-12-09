"use strict";

const { getLast } = require("../../../common/util.js");

/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Transform} FromMarkdownTransform
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 */

/**
 * @returns {FromMarkdownExtension}
 */
function preserveReferenceCharacetersFromMarkdown() {
  /** @type {FromMarkdownHandle} */
  function enterCharacterReference(token) {
    this.enter({ type: "text", value: "" }, token);
  }

  /** @type {FromMarkdownHandle} */
  function exitCharacterReference(token) {
    const node = getLast(this.stack);
    const value = this.sliceSerialize(token);
    node.value = value;
    this.exit(token);
  }

  /** @type {FromMarkdownExtension} */
  const extension = {
    enter: { characterReference: enterCharacterReference },
    exit: { characterReference: exitCharacterReference },
  };
  return extension;
}

module.exports = { preserveReferenceCharacetersFromMarkdown };
