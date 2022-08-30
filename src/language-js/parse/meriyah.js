import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import postprocess from "./postprocess/index.js";

// https://github.com/meriyah/meriyah/blob/4676f60b6c149d7082bde2c9147f9ae2359c8075/src/parser.ts#L185
const parseOptions = {
  // Allow module code
  module: true,
  // Enable stage 3 support (ESNext)
  next: true,
  // Enable start and end offsets to each node
  ranges: true,
  // Enable web compatibility
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
  lexical: false,
  // Adds a source attribute in every node’s loc object when the locations option is `true`
  // source: '',
  // Distinguish Identifier from IdentifierPattern
  identifierPattern: false,
  // Enable React JSX parsing
  jsx: true,
  // Allow edge cases that deviate from the spec
  specDeviation: true,
  // Creates unique key for in ObjectPattern when key value are same
  uniqueKeyInPattern: false,
};

function parseWithOptions(parse, text, module) {
  const comments = [];
  const tokens = [];

  /** @type {any} */
  const ast = parse(text, {
    ...parseOptions,
    module,
    onComment: comments,
    onToken: tokens,
  });
  ast.comments = comments;
  ast.tokens = tokens;

  return ast;
}

function createParseError(error) {
  let { message, line, column } = error;

  const matches = (
    message.match(/^\[(?<line>\d+):(?<column>\d+)]: (?<message>.*)$/) || {}
  ).groups;

  if (matches) {
    message = matches.message;

    /* istanbul ignore next */
    if (typeof line !== "number") {
      line = Number(matches.line);
      column = Number(matches.column);
    }
  }

  /* istanbul ignore next */
  if (typeof line !== "number") {
    return error;
  }

  return createError(message, {
    loc: { start: { line, column } },
    cause: error,
  });
}

async function parse(text, options = {}) {
  const { parse } = await import("meriyah");
  const { result: ast, error: moduleParseError } = tryCombinations(
    () => parseWithOptions(parse, text, /* module */ true),
    () => parseWithOptions(parse, text, /* module */ false)
  );

  if (!ast) {
    // Throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  options.originalText = text;
  return postprocess(ast, options);
}

const parser = {
  parsers: {
    meriyah: createParser(parse),
  },
};

export default parser;
