"use strict";

const getHighestAncestor = (node) => {
  while (node.parent) {
    node = node.parent;
  }
  return node;
};

module.exports = getHighestAncestor;
