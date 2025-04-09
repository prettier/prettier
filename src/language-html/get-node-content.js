import {
  needsToBorrowLastChildClosingTagEndMarker,
  needsToBorrowParentClosingTagStartMarker,
  needsToBorrowParentOpeningTagEndMarker,
  printClosingTagEndMarker,
  printClosingTagStartMarker,
  printOpeningTagEndMarker,
} from "./print/tag.js";

function getNodeContent(node, options) {
  if (!node.endSourceSpan) {
    return "";
  }

  let start = node.startSourceSpan.end.offset;
  if (
    node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
  ) {
    start -= printOpeningTagEndMarker(node).length;
  }

  let end = node.endSourceSpan.start.offset;
  if (
    node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
  ) {
    end += printClosingTagStartMarker(node, options).length;
  } else if (needsToBorrowLastChildClosingTagEndMarker(node)) {
    end -= printClosingTagEndMarker(node.lastChild, options).length;
  }

  return options.originalText.slice(start, end);
}

export default getNodeContent;
