"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { defineShortcut, mapNode } = require("./utils");

function defineShortcuts(node) {
  switch (node.type) {
    case "document":
      defineShortcut(node, "head", () => node.children[0]);
      defineShortcut(node, "body", () => node.children[1]);
      break;
    case "documentBody":
    case "sequenceItem":
    case "flowSequenceItem":
    case "mappingKey":
    case "mappingValue":
      defineShortcut(node, "content", () => node.children[0]);
      break;
    case "mappingItem":
    case "flowMappingItem":
      defineShortcut(node, "key", () => node.children[0]);
      defineShortcut(node, "value", () => node.children[1]);
      break;
  }
  return node;
}

function parse(text) {
  try {
    const root = mapNode(
      require("yaml-unist-parser").parse(text),
      defineShortcuts
    );

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
    throw error && error.position
      ? createError(error.message, error.position)
      : error;
  }
}

const parser = {
  astFormat: "yaml",
  parse,
  hasPragma,
  locStart: node => node.position.start.offset,
  locEnd: node => node.position.end.offset,

  // workaround for https://github.com/eemeli/yaml/issues/20
  preprocess: text =>
    text.indexOf("\r") === -1 ? text : text.replace(/\r\n?/g, "\n")
};

module.exports = {
  parsers: {
    yaml: parser
  }
};
