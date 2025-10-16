import { ParseSourceSpan } from "angular-html-parser";

// https://css-tricks.com/how-to-create-an-ie-only-stylesheet

/**
@import {Ast} from "angular-html-parser";
*/

const parseFunctions = [
  {
    // <!--[if ... ]> ... <![endif]-->
    regex:
      /^(?<openingTagSuffix>\[if(?<condition>[^\]]*)\]>)(?<data>.*?)<!\s*\[endif\]$/su,
    parse: parseIeConditionalStartEndComment,
  },
  {
    // <!--[if ... ]><!-->
    regex: /^\[if(?<condition>[^\]]*)\]><!$/u,
    parse: parseIeConditionalStartComment,
  },
  {
    // <!--<![endif]-->
    regex: /^<!\s*\[endif\]$/u,
    parse: parseIeConditionalEndComment,
  },
];

/**
@param {Ast.Comment} node
*/
function parseIeConditionalComment(node, parseHtml) {
  if (node.value) {
    for (const { regex, parse } of parseFunctions) {
      const match = node.value.match(regex);
      if (match) {
        return parse(node, match, parseHtml);
      }
    }
  }
  return null;
}

/**
@param {Ast.Comment} node
*/
function parseIeConditionalStartEndComment(node, match, parseHtml) {
  const { openingTagSuffix, condition, data } = match.groups;
  const offset = "<!--".length + openingTagSuffix.length;
  const contentStartSpan = node.sourceSpan.start.moveBy(offset);
  const contentEndSpan = contentStartSpan.moveBy(data.length);
  const [complete, children] = (() => {
    try {
      return [true, parseHtml(data, contentStartSpan).children];
    } catch {
      const text = {
        kind: "text",
        value: data,
        sourceSpan: new ParseSourceSpan(contentStartSpan, contentEndSpan),
      };
      return [false, [text]];
    }
  })();
  return {
    kind: "ieConditionalComment",
    complete,
    children,
    condition: condition.trim().replaceAll(/\s+/gu, " "),
    sourceSpan: node.sourceSpan,
    startSourceSpan: new ParseSourceSpan(
      node.sourceSpan.start,
      contentStartSpan,
    ),
    endSourceSpan: new ParseSourceSpan(contentEndSpan, node.sourceSpan.end),
  };
}

/**
@param {Ast.Comment} node
*/
function parseIeConditionalStartComment(node, match /* , parseHtml */) {
  const { condition } = match.groups;
  return {
    kind: "ieConditionalStartComment",
    condition: condition.trim().replaceAll(/\s+/gu, " "),
    sourceSpan: node.sourceSpan,
  };
}

function parseIeConditionalEndComment(node /* , match, parseHtml */) {
  return {
    kind: "ieConditionalEndComment",
    sourceSpan: node.sourceSpan,
  };
}

export { parseIeConditionalComment };
