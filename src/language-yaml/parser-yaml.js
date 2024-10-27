"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");

function parse(text) {
  const { parse } = require("yaml-unist-parser");

  try {
    const root = parse(text);

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
  locStart,
  locEnd,
};

module.exports = {
  parsers: {
    yaml: parser,
  },
};
