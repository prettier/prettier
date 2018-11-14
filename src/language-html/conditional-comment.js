"use strict";

function parseIeConditionalComment(node, parseHtml) {
  if (!node.value) {
    return null;
  }

  const match = node.value.match(
    /^(\[if([^\]]*?)\]>)([\s\S]*?)<!\s*\[endif\]$/
  );

  if (!match) {
    return null;
  }

  const [, openingTagSuffix, condition, data] = match;
  const offset = "<!--".length + openingTagSuffix.length;
  const contentStartSpan = node.sourceSpan.start.moveBy(offset);
  const contentEndSpan = contentStartSpan.moveBy(data.length);
  const ParseSourceSpan = node.sourceSpan.constructor;
  const [complete, children] = (() => {
    try {
      return [true, parseHtml(data, contentStartSpan).children];
    } catch (e) {
      const text = {
        type: "text",
        value: data,
        sourceSpan: new ParseSourceSpan(contentStartSpan, contentEndSpan)
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
    endSourceSpan: new ParseSourceSpan(contentEndSpan, node.sourceSpan.end)
  };
}

module.exports = {
  parseIeConditionalComment
};
