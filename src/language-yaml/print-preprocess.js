import assert from "node:assert";
import { mapNode } from "./utils.js";

function preprocess(ast) {
  return mapNode(ast, defineShortcuts);
}

function defineShortcuts(node) {
  switch (node.type) {
    case "document":
      assert.ok(node.children.length <= 2);
      [node.head, node.body] = node.children;
      break;
    case "documentBody":
    case "sequenceItem":
    case "flowSequenceItem":
    case "mappingKey":
    case "mappingValue":
      assert.ok(node.children.length <= 1);
      [node.content] = node.children;
      break;
    case "mappingItem":
    case "flowMappingItem":
      assert.ok(node.children.length <= 2);
      [node.key, node.value] = node.children;
      break;
  }
  return node;
}

export default preprocess;
