import { parse as meriyahParse } from "meriyah";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import postprocess from "./postprocess/index.js";
import getSourceType from "./utils/get-source-type.js";

// https://github.com/meriyah/meriyah/blob/4676f60b6c149d7082bde2c9147f9ae2359c8075/src/parser.ts#L185
const parseOptions = {
  // Allow module code
  // module: true,
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

function parseWithOptions(text, sourceType) {
  const comments = [];
  const tokens = [];

  /** @type {any} */
  const ast = meriyahParse(text, {
    ...parseOptions,
    module: sourceType === "module",
    onComment: comments,
    onToken: tokens,
  });
  ast.comments = comments;
  ast.tokens = tokens;

  return ast;
}

function createParseError(error) {
  let { message, line, column } = error;

  const matches = message.match(
    /^\[(?<line>\d+):(?<column>\d+)]: (?<message>.*)$/,
  )?.groups;

  if (matches) {
    message = matches.message;

    /* c8 ignore next 4 */
    if (typeof line !== "number") {
      line = Number(matches.line);
      column = Number(matches.column);
    }
  }

  /* c8 ignore next 3 */
  if (typeof line !== "number") {
    return error;
  }

  return createError(message, {
    loc: { start: { line, column } },
    cause: error,
  });
}

function parse(text, options = {}) {
  const sourceType = getSourceType(options);
  const combinations = (sourceType ? [sourceType] : ["module", "script"]).map(
    (sourceType) => () => parseWithOptions(text, sourceType),
  );

  let ast;
  try {
    ast = tryCombinations(combinations);
  } catch (/** @type {any} */ { errors: [error] }) {
    throw createParseError(error);
  }

  return postprocess(ast, { parser: "meriyah", text });
}

export const meriyah = createParser(parse);
