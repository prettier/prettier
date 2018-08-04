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

module.exports = {
  getOrderedListItemInfo
};
