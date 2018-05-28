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

function _parse(text) {
  return require("yaml-unist-parser").parse(
    text.length === 0 || text[text.length - 1] === "\n" ? text : text + "\n"
  );
}

function parse(text) {
  try {
    const root = mapNode(_parse(text), node => {
      // replace explicit empty MappingKey/MappingValue with implicit one
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

    /**
     * suppress `comment not printed` error
     *
     * comments are handled in printer-yaml.js without using `printComment`
     * so that it'll always throw errors even if we printed it correctly
     */
    delete root.comments;

    return root;
  } catch (error) {
    // istanbul ignore next
    throw error && error.name === "YAMLSyntaxError"
      ? createError(error.message, error.position)
      : error;
  }
}

const parser = {
  astFormat: "yaml",
  parse,
  hasPragma,
  locStart: node => node.position.start.offset,
  locEnd: node => node.position.end.offset
};

module.exports = {
  parsers: {
    yaml: parser
  }
};
