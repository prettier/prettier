"use strict";

function parse(text /*, parsers, opts*/) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parse5 = require("parse5");
  try {
    const isFragment = !/^\s*<(!doctype|html|head|body|!--)/i.test(text);
    const ast = (isFragment ? parse5.parseFragment : parse5.parse)(text, {
      treeAdapter: parse5.treeAdapters.htmlparser2,
      locationInfo: true
    });
    return normalize(extendAst(ast));
  } catch (error) {
    throw error;
  }
}

function normalize(ast) {
  if (Array.isArray(ast)) {
    return ast.map(normalize);
  }

  if (!ast || typeof ast !== "object") {
    return ast;
  }

  delete ast.parent;
  delete ast.next;
  delete ast.prev;

  for (const key of Object.keys(ast)) {
    ast[key] = normalize(ast[key]);
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
        return node.__location && node.__location.startOffset;
      },
      locEnd(node) {
        return node.__location && node.__location.endOffset;
      }
    }
  }
};
