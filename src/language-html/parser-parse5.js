"use strict";

const htmlTagNames = require("html-tag-names");
const parseFrontMatter = require("../utils/front-matter");

const nonFragmentRegex = /^\s*(<!--[\s\S]*?-->\s*)*<(!doctype|html|head|body)[\s>]/i;

function parse(text /*, parsers, opts*/) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parse5 = require("parse5");
  const htmlparser2TreeAdapter = require("parse5-htmlparser2-tree-adapter");

  const { frontMatter, content } = parseFrontMatter(text);

  const isFragment = !nonFragmentRegex.test(content);
  const ast = (isFragment ? parse5.parseFragment : parse5.parse)(content, {
    treeAdapter: htmlparser2TreeAdapter,
    sourceCodeLocationInfo: true
  });

  const normalizedAst = normalize(extendAst(ast), content);

  if (frontMatter) {
    normalizedAst.children.unshift(frontMatter);
  }

  return normalizedAst;
}

function normalize(ast, text) {
  if (Array.isArray(ast)) {
    return ast.map(child => normalize(child, text));
  }

  if (!ast || typeof ast !== "object") {
    return ast;
  }

  delete ast.parent;
  delete ast.next;
  delete ast.prev;

  // preserve case-sensitive tag names
  if (
    ast.type === "tag" &&
    ast.sourceCodeLocation &&
    htmlTagNames.indexOf(ast.name) === -1
  ) {
    ast.name = text.slice(
      ast.sourceCodeLocation.startOffset + 1, // <
      ast.sourceCodeLocation.startOffset + 1 + ast.name.length
    );
  }

  for (const key of Object.keys(ast)) {
    ast[key] = normalize(ast[key], text);
  }

  return ast;
}

function extendAst(ast) {
  if (!ast || !ast.children) {
    return ast;
  }
  for (const child of ast.children) {
    extendAst(child);
    if (child.attribs) {
      child.attributes = convertAttribs(child.attribs);
    }
  }
  return ast;
}

function convertAttribs(attribs) {
  return Object.keys(attribs).map(attributeKey => {
    return {
      type: "attribute",
      key: attributeKey,
      value: attribs[attributeKey]
    };
  });
}

module.exports = {
  parsers: {
    parse5: {
      parse,
      astFormat: "htmlparser2",
      locStart(node) {
        return node.sourceCodeLocation && node.sourceCodeLocation.startOffset;
      },
      locEnd(node) {
        return node.sourceCodeLocation && node.sourceCodeLocation.endOffset;
      }
    }
  }
};
