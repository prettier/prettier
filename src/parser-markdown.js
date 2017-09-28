"use strict";

const map = require("unist-util-map");
const remarkFrontmatter = require("remark-frontmatter");
const remarkParse = require("remark-parse");
const unified = require("unified");

function splitText() {
  return ast =>
    map(ast, node => {
      return node.type !== "text"
        ? node
        : {
            type: "sentence",
            children: node.value
              .split(/(\s+)/g)
              .map(
                (text, index) =>
                  index % 2 === 0
                    ? { type: "word", value: text }
                    : { type: "whitespace", value: " " }
              )
              .filter(node => node.value.length) // remove empty word
          };
    });
}

function parse(text /*, parsers, opts*/) {
  const processor = unified()
    .use(remarkParse, { position: false, footnotes: true })
    .use(remarkFrontmatter, ["yaml"])
    .use(splitText);
  return processor.runSync(processor.parse(text));
}

module.exports = parse;
