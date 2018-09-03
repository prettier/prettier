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
