"use strict";
const { getShebang } = require("../common/util");
const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./postprocess");

// https://github.com/meriyah/meriyah/blob/4676f60b6c149d7082bde2c9147f9ae2359c8075/src/parser.ts#L185
const parseOptions = {
  // Allow module code
  module: true,
  // Enable stage 3 support (ESNext)
  next: true,
  // Enable start and end offsets to each node
  ranges: true,
  // Enable web compability
  webcompat: true,
  // Enable line/column location information to each node
  loc: true,
  // Attach raw property to each literal and identifier node
  raw: true,
  // Enabled directives
  directives: true,
  // Allow return in the global scope
  globalReturn: true,
  // Enable implied strict mode
  impliedStrict: false,
  // Enable non-standard parenthesized expression node
  preserveParens: false,
  // Enable lexical binding and scope tracking
  lexical: true,
  // Adds a source attribute in every node’s loc object when the locations option is `true`
  source: true,
  // Distinguish Identifier from IdentifierPattern
  identifierPattern: true,
  // Enable React JSX parsing
  jsx: true,
  // Allow edge cases that deviate from the spec
  specDeviation: true,
  // Creates unique key for in ObjectPattern when key value are same
  uniqueKeyInPattern: true,
};

function handleComment(type, value, start, end, text) {
  if (type === "HashbangComment") {
    type = "Line";
  } else if (type === "SingleLine") {
    type = "Line";
    // https://github.com/meriyah/meriyah/issues/126
    if (start === end) {
      end += 2;
    }
  } else {
    type = "Block";
  }

  // console.log({
  //   text,
  //   type,
  //   start,
  //   value,
  //   range: [start, end],
  // });

  return {
    type,
    value,
    range: [start, end],
  };
}

function parse(text, parsers, options) {
  const { parse } = require("meriyah");

  let ast;

  try {
    const comments = [];
    const tokens = [];
    ast = parse(text, {
      ...parseOptions,
      onComment(type, value, start, end) {
        comments.push(handleComment(type, value, start, end, text));
      },
      onToken(type, start, end) {
        tokens.push({
          type,
          value: text.slice(start, end),
          range: [start, end],
        });
      },
    });

    ast.comments = comments;
    ast.tokens = tokens;
  } catch (error) {
    try {
      const comments = [];
      const tokens = [];
      ast = parse(text, {
        ...parseOptions,
        module: false,
        onComment(type, value, start, end) {
          comments.push(handleComment(type, value, start, end));
        },
        onToken(type, start, end) {
          tokens.push({
            type,
            value: text.slice(start, end),
            range: [start, end],
          });
        },
      });

      ast.comments = comments;
      ast.tokens = tokens;
    } catch (_) {
      // throw the error for `module` parsing
      if (typeof error.loc === "undefined") {
        throw error;
      }

      throw createError(error.message, {
        start: error.loc,
      });
    }
  }

  return postprocess(ast, { ...options, originalText: text });
}

module.exports = {
  parsers: {
    meriyah: { parse, astFormat: "estree", hasPragma, locStart, locEnd },
  },
};
