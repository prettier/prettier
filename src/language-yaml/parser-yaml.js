"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { createNull, defineShortcut, mapNode } = require("./utils");

function defineShortcuts(node) {
  switch (node.type) {
    case "document":
      defineShortcut(node, "head", () => node.children[0]);
      defineShortcut(node, "body", () => node.children[1]);
      break;
    case "sequenceItem":
    case "flowSequenceItem":
    case "mappingKey":
    case "mappingValue":
      defineShortcut(node, "node", () => node.children[0]);
      break;
    case "mappingItem":
    case "flowMappingItem":
      defineShortcut(node, "key", () => node.children[0]);
      defineShortcut(node, "value", () => node.children[1]);
      break;
  }
}

function parse(text) {
  return require("yaml-unist-parser").parse(
    text.length === 0 || text[text.length - 1] === "\n" ? text : text + "\n"
  );
}

const parser = {
  astFormat: "yaml",
  parse: text => {
    try {
      const root = mapNode(parse(text), node => {
        if (
          (node.type === "mappingKey" || node.type === "mappingValue") &&
          node.children[0].type === "null" &&
          node.leadingComments.length === 0 &&
          node.trailingComments.length === 0
        ) {
          return createNull();
        }
        defineShortcuts(node);
        return node;
      });
      delete root.comments; // suppress not printed error, comments are handled ourselves
      return root;
    } catch (error) {
      // istanbul ignore next
      if (error && error.name === "YAMLSyntaxError") {
        throw createError(error.message, error.position);
      }
      // istanbul ignore next
      throw error;
    }
  },
  locStart: /* istanbul ignore next */ node => node.position.start.offset,
  locEnd: /* istanbul ignore next */ node => node.position.end.offset,
  hasPragma
};

module.exports = {
  parsers: {
    yaml: parser
  }
};
