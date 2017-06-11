"use strict";

// const createError = require("./parser-create-error");

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parse5 = require("parse5");
  try {
    const isFragment = !/^\s*<(!doctype|html|head|body)/i.test(text);
    const ast = (isFragment ? parse5.parseFragment : parse5.parse)(text, {
      treeAdapter: parse5.treeAdapters.htmlparser2,
      locationInfo: true
    });
    return ast;
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

module.exports = parse;
