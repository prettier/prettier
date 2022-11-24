"use strict";

function isUnknownNamespace(node) {
  return (
    node.type === "element" &&
    !node.hasExplicitNamespace &&
    !["html", "svg"].includes(node.namespace)
  );
}

module.exports = isUnknownNamespace;
