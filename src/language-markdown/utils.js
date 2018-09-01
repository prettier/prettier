"use strict";

function getOrderedListItemInfo(orderListItem, originalText) {
  const [, numberText, marker, leadingSpaces] = originalText
    .slice(
      orderListItem.position.start.offset,
      orderListItem.position.end.offset
    )
    .match(/^\s*(\d+)(\.|\))(\s*)/);

  return { numberText, marker, leadingSpaces };
}

// workaround for https://github.com/remarkjs/remark/issues/351
// leading and trailing newlines are stripped by remark
function getFencedCodeBlockValue(node, originalText) {
  const text = originalText.slice(
    node.position.start.offset,
    node.position.end.offset
  );

  const leadingSpaceCount = text.match(/^\s*/)[0].length;
  const replaceRegex = new RegExp(`^\\s{0,${leadingSpaceCount}}`);

  const lineContents = text.split("\n");

  const markerStyle = text[leadingSpaceCount]; // ` or ~
  const marker = text
    .slice(leadingSpaceCount)
    .match(new RegExp(`^[${markerStyle}]+`))[0];

  // https://spec.commonmark.org/0.28/#example-104: Closing fences may be indented by 0-3 spaces
  // https://spec.commonmark.org/0.28/#example-93: The closing code fence must be at least as long as the opening fence
  const hasEndMarker = new RegExp(`^\\s{0,3}${marker}`).test(
    lineContents[lineContents.length - 1].slice(
      getIndent(lineContents.length - 1)
    )
  );

  return lineContents
    .slice(1, hasEndMarker ? -1 : undefined)
    .map((x, i) => x.slice(getIndent(i + 1)).replace(replaceRegex, ""))
    .join("\n");

  function getIndent(lineIndex) {
    return node.position.indent[lineIndex - 1] - 1;
  }
}

function mapAst(ast, handler) {
  return (function preorder(node, index, parentStack) {
    parentStack = parentStack || [];

    const newNode = Object.assign({}, handler(node, index, parentStack));
    if (newNode.children) {
      newNode.children = newNode.children.map((child, index) => {
        return preorder(child, index, [newNode].concat(parentStack));
      });
    }

    return newNode;
  })(ast, null, null);
}

module.exports = {
  mapAst,
  getFencedCodeBlockValue,
  getOrderedListItemInfo
};
