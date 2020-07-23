"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");

function parse(text) {
  try {
    const root = require("yaml-unist-parser").parse(text);

    /**
     * suppress `comment not printed` error
     *
     * comments are handled in printer-yaml.js without using `printComment`
     * so that it'll always throw errors even if we printed it correctly
     */
    delete root.comments;

    return root;
  } catch (error) {
    if (error && error.position) {
      throw createError(error.message, error.position);
    }

    /* istanbul ignore next */
    throw error;
  }
}

const parser = {
  astFormat: "yaml",
  parse,
  hasPragma,
  locStart(node) {
    return node.position.start.offset;
  },
  /* istanbul ignore next */
  locEnd(node) {
    return node.position.end.offset;
  },
};

module.exports = {
  parsers: {
    yaml: parser,
  },
};
