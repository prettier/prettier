"use strict";

const { preserveReferenceCharacetersFromMarkdown } = require("./mdast-util.js");
const { preserveReferenceCharaceters } = require("./micromark-extension.js");

function preserveReferenceCharacetersPlugin() {
  const data = this.data();

  add("micromarkExtensions", preserveReferenceCharaceters);
  add("fromMarkdownExtensions", preserveReferenceCharacetersFromMarkdown());

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    const list /** @type {unknown[]} */ = data[field]
      ? data[field]
      : (data[field] = []);

    list.push(value);
  }
}

module.exports = preserveReferenceCharacetersPlugin;
