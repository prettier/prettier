"use strict";

const {
  ParseSourceSpan,
} = require("angular-html-parser/lib/compiler/src/parse_util");

// https://css-tricks.com/how-to-create-an-ie-only-stylesheet

const parseFunctions = [
  {
    // <!--[if ... ]> ... <![endif]-->
    regex: /^(\[if([^\]]*?)]>)(.*?)<!\s*\[endif]$/s,
    parse: parseIeConditionalStartEndComment,
  },
  {
    // <!--[if ... ]><!-->
    regex: /^\[if([^\]]*?)]><!$/,
    parse: parseIeConditionalStartComment,
  },
  {
    // <!--<![endif]-->
    regex: /^<!\s*\[endif]$/,
    parse: parseIeConditionalEndComment,
  },
];

function parseIeConditionalComment(node, parseHtml) {
  if (node.value) {
    for (const { regex, parse } of parseFunctions) {
      const match = node.value.match(regex);
      if (match) {
        return parse(node, parseHtml, match);
      }
    }
  }
  return null;
}

function parseIeConditionalStartEndComment(node, parseHtml, match) {
  const [, openingTagSuffix, condition, data] = match;
  const offset = "<!--".length + openingTagSuffix.length;
  const contentStartSpan = node.sourceSpan.start.moveBy(offset);
  const contentEndSpan = contentStartSpan.moveBy(data.length);
  const [complete, children] = (() => {
    try {
      return [true, parseHtml(data, contentStartSpan).children];
    } catch {
      const text = {
        type: "text",
        value: data,
        sourceSpan: new ParseSourceSpan(contentStartSpan, contentEndSpan),
      };
      return [false, [text]];
    }
  })();
  return {
    type: "ieConditionalComment",
    complete,
    children,
    condition: condition.trim().replace(/\s+/g, " "),
    sourceSpan: node.sourceSpan,
    startSourceSpan: new ParseSourceSpan(
      node.sourceSpan.start,
      contentStartSpan
    ),
    endSourceSpan: new ParseSourceSpan(contentEndSpan, node.sourceSpan.end),
  };
}

function parseIeConditionalStartComment(node, parseHtml, match) {
  const [, condition] = match;
  return {
    type: "ieConditionalStartComment",
    condition: condition.trim().replace(/\s+/g, " "),
    sourceSpan: node.sourceSpan,
  };
}

function parseIeConditionalEndComment(node /*, parseHtml, match */) {
  return {
    type: "ieConditionalEndComment",
    sourceSpan: node.sourceSpan,
  };
}

module.exports = {
  parseIeConditionalComment,
};
