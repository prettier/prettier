"use strict";

// const createError = require("./parser-create-error");

function parse(text /*, parsers, opts*/) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parse5 = require("parse5");
  try {
    const isFragment = !/^\s*<(!doctype|html|head|body)/i.test(text);
    const ast = (isFragment ? parse5.parseFragment : parse5.parse)(text, {
      treeAdapter: parse5.treeAdapters.htmlparser2,
      locationInfo: true
    });
    return extendAst(ast);
  } catch (error) {
    //   throw createError(error.message, {
    //     start: {
    //       line: error.locations[0].line,
    //       column: error.locations[0].column
    //     }
    // } else {
    throw error;
    // }
  }
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

module.exports = parse;
