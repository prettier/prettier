"use strict";

const remarkFrontmatter = require("remark-frontmatter");
const remarkParse = require("remark-parse");
const unified = require("unified");

function map(ast, handler) {
  return (function preorder(node, index, parent) {
    const newNode = Object.assign({}, handler(node, index, parent));
    if (newNode.children) {
      newNode.children = newNode.children.map((child, index) => {
        return preorder(child, index, newNode);
      });
    }
    return newNode;
  })(ast, null, null);
}

function mergeContinuousTexts() {
  return ast =>
    map(ast, node => {
      if (!node.children) {
        return node;
      }
      const children = node.children.reduce((current, child) => {
        const lastChild = current[current.length - 1];
        if (lastChild && lastChild.type === "text" && child.type === "text") {
          current.splice(-1, 1, {
            type: "text",
            value: lastChild.value + child.value,
            position: {
              start: lastChild.position.start,
              end: child.position.end
            }
          });
        } else {
          current.push(child);
        }
        return current;
      }, []);
      return Object.assign({}, node, { children });
    });
}

function splitText() {
  return ast =>
    map(ast, node => {
      return node.type !== "text"
        ? node
        : {
            type: "sentence",
            position: node.position,
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
    .use(remarkParse, { footnotes: true })
    .use(remarkFrontmatter, ["yaml"])
    .use(mergeContinuousTexts)
    .use(splitText);
  return processor.runSync(processor.parse(text));
}

module.exports = parse;
