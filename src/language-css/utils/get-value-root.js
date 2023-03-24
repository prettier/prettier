"use strict";

const getValueRoot = (node) => {
  while (node.parent) {
    node = node.parent;
  }

  return node.type;
};

module.exports = getValueRoot;
