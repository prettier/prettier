"use strict";

const getRootNode = (node) => {
  while (node.parent) {
    node = node.parent;
  }

  return node;
};

module.exports = getRootNode;
