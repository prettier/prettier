"use strict";

const remarkFrontmatter = require("remark-frontmatter");
const remarkParse = require("remark-parse");
const unified = require("unified");
const util = require("./util");

/**
 * based on [MDAST](https://github.com/syntax-tree/mdast) with following modifications:
 *
 * 1. restore unescaped character (Text)
 * 2. merge continuous Texts
 * 3. transform InlineCode#value into InlineCode#children (Text)
 * 4. split Text into Sentence
 *
 * interface Word { value: string }
 * interface Whitespace { value: string }
 * interface Sentence { children: Array<Word | Whitespace> }
 * interface InlineCode { children: Array<Sentence> }
 */
function parse(text /*, parsers, opts*/) {
  const processor = unified()
    .use(remarkParse, { footnotes: true, commonmark: true })
    .use(remarkFrontmatter, ["yaml"])
    .use(restoreUnescapedCharacter(text))
    .use(mergeContinuousTexts)
    .use(transformInlineCode(text))
    .use(splitText);
  return processor.runSync(processor.parse(text));
}

function map(ast, handler) {
  return (function preorder(node, index, parentNode) {
    const newNode = Object.assign({}, handler(node, index, parentNode));
    if (newNode.children) {
      newNode.children = newNode.children.map((child, index) => {
        return preorder(child, index, newNode);
      });
    }
    return newNode;
  })(ast, null, null);
}

function transformInlineCode(originalText) {
  return () => ast =>
    map(ast, node => {
      if (node.type !== "inlineCode") {
        return node;
      }

      const rawContent = originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );

      const style = rawContent.match(/^`+/)[0];

      return Object.assign({}, node, {
        value: node.value.replace(/\s+/g, " "),
        children: [
          {
            type: "text",
            value: node.value,
            position: {
              start: {
                line: node.position.start.line,
                column: node.position.start.column + style.length,
                offset: node.position.start.offset + style.length
              },
              end: {
                line: node.position.end.line,
                column: node.position.end.column - style.length,
                offset: node.position.end.offset - style.length
              }
            }
          }
        ]
      });
    });
}

function restoreUnescapedCharacter(originalText) {
  return () => ast =>
    map(ast, node => {
      return node.type !== "text"
        ? node
        : Object.assign({}, node, {
            value:
              node.value !== "*" &&
              node.value !== "_" && // handle these two cases in printer
              node.value.length === 1 &&
              node.position.end.offset - node.position.start.offset > 1
                ? originalText.slice(
                    node.position.start.offset,
                    node.position.end.offset
                  )
                : node.value
          });
    });
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
    map(ast, (node, index, parentNode) => {
      if (node.type !== "text") {
        return node;
      }

      let value = node.value;

      if (parentNode.type === "paragraph") {
        if (index === 0) {
          value = value.trimLeft();
        }
        if (index === parentNode.children.length - 1) {
          value = value.trimRight();
        }
      }

      return {
        type: "sentence",
        position: node.position,
        children: util.splitText(value)
      };
    });
}

module.exports = parse;
