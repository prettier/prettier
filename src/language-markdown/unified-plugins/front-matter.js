"use strict";

const parseFrontMatter = require("../../utils/front-matter/parse.js");

function frontMatter() {
  const proto = this.Parser.prototype;
  proto.blockMethods = ["frontMatter", ...proto.blockMethods];
  proto.blockTokenizers.frontMatter = tokenizer;

  function tokenizer(eat, value) {
    const parsed = parseFrontMatter(value);

    if (parsed.frontMatter) {
      return eat(parsed.frontMatter.raw)(parsed.frontMatter);
    }
  }
  tokenizer.onlyAtStart = true;
}

module.exports = frontMatter;
